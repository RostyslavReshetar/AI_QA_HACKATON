/**
 * Claude CLI Runner — wraps `claude -p` for non-interactive agent execution.
 * Handles prompt construction, execution, logging, and error handling.
 */
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import type { AILogEntry, AgentConfig } from './types.js';

const AI_LOGS_DIR = 'ai-logs';

export interface ClaudeRunnerOptions {
  projectRoot: string;
  model: string;
  dryRun: boolean;
  verbose: boolean;
  timeoutMs: number;
}

export class ClaudeRunner {
  private options: ClaudeRunnerOptions;

  constructor(options: ClaudeRunnerOptions) {
    this.options = options;
  }

  /**
   * Run a Claude CLI agent with the given system prompt and user prompt.
   * Logs everything to ai-logs/.
   */
  async run(
    agent: AgentConfig,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<{ output: string; durationMs: number }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logDir = path.join(this.options.projectRoot, AI_LOGS_DIR);
    await fs.ensureDir(logDir);

    if (this.options.dryRun) {
      const logEntry = this.buildLogEntry(agent, systemPrompt, userPrompt, '[DRY RUN — no Claude call made]', 0, true);
      await this.writeLog(logDir, timestamp, agent.name, logEntry);
      return { output: '[DRY RUN]', durationMs: 0 };
    }

    const startTime = Date.now();
    let output = '';
    let success = true;
    let error: string | undefined;

    try {
      const result = await execa('claude', [
        '-p',
        '--model', this.options.model,
        '--output-format', 'text',
        '--verbose',
      ], {
        input: this.buildFullPrompt(systemPrompt, userPrompt),
        timeout: this.options.timeoutMs,
        cwd: this.options.projectRoot,
        env: {
          ...process.env,
          CLAUDE_CODE_SIMPLE: '1',
        },
      });

      output = result.stdout;
    } catch (err: unknown) {
      success = false;
      if (err instanceof Error) {
        error = err.message;
        // If the process produced stdout before failing, capture it
        const execaError = err as { stdout?: string };
        output = execaError.stdout || '';
      }
    }

    const durationMs = Date.now() - startTime;

    // Log the interaction
    const logEntry = this.buildLogEntry(agent, systemPrompt, userPrompt, output, durationMs, success, error);
    await this.writeLog(logDir, timestamp, agent.name, logEntry);

    if (this.options.verbose) {
      console.log(`\n--- Agent: ${agent.name} (${durationMs}ms) ---`);
      console.log(output.substring(0, 2000));
      if (output.length > 2000) console.log(`... (${output.length} chars total)`);
      console.log('---\n');
    }

    if (!success) {
      throw new Error(`Agent ${agent.name} failed: ${error}`);
    }

    return { output, durationMs };
  }

  private buildFullPrompt(systemPrompt: string, userPrompt: string): string {
    return [
      '<system-instructions>',
      systemPrompt,
      '</system-instructions>',
      '',
      userPrompt,
    ].join('\n');
  }

  private buildLogEntry(
    agent: AgentConfig,
    systemPrompt: string,
    userPrompt: string,
    response: string,
    durationMs: number,
    success: boolean,
    error?: string,
  ): AILogEntry {
    return {
      timestamp: new Date().toISOString(),
      agentName: agent.name,
      phase: agent.phase,
      prompt: userPrompt,
      systemPrompt,
      response,
      durationMs,
      success,
      error,
      estimatedTokens: {
        input: Math.ceil((systemPrompt.length + userPrompt.length) / 4),
        output: Math.ceil(response.length / 4),
      },
    };
  }

  private async writeLog(
    logDir: string,
    timestamp: string,
    agentName: string,
    entry: AILogEntry,
  ): Promise<void> {
    const filename = `${timestamp}-${agentName}.json`;
    const filepath = path.join(logDir, filename);
    await fs.writeJson(filepath, entry, { spaces: 2 });
  }
}
