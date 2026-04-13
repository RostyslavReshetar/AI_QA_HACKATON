/**
 * Core orchestrator — coordinates all agents through phases.
 * Phase 1: Research → requirements extraction
 * Phase 2: Test Design → UI/API manual test cases + RTM
 * Phase 3: Code Generation → Playwright UI/API automation
 * Phase 4: Review → code quality review
 */
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { ClaudeRunner } from './claude-runner.js';
import { ResearchAgent } from './agents/research.agent.js';
import { TestDesignUIAgent } from './agents/test-design-ui.agent.js';
import { TestDesignAPIAgent } from './agents/test-design-api.agent.js';
import { CodeGenUIAgent } from './agents/code-gen-ui.agent.js';
import { CodeGenAPIAgent } from './agents/code-gen-api.agent.js';
import { ReviewerAgent } from './agents/reviewer.agent.js';
import { RTMAgent } from './agents/rtm.agent.js';
import type { Agent, AgentContext, AgentResult, OrchestratorOptions, OutputFile } from './types.js';

export class Orchestrator {
  private runner: ClaudeRunner;
  private options: OrchestratorOptions;
  private results: Map<string, AgentResult> = new Map();
  private agents: Agent[];

  constructor(options: OrchestratorOptions) {
    this.options = options;
    this.runner = new ClaudeRunner({
      projectRoot: options.projectRoot,
      model: options.model,
      dryRun: options.dryRun,
      verbose: options.verbose,
      timeoutMs: 10 * 60 * 1000, // 10 minutes per agent
    });

    this.agents = [
      new ResearchAgent(),
      new TestDesignUIAgent(),
      new TestDesignAPIAgent(),
      new RTMAgent(),
      new CodeGenUIAgent(),
      new CodeGenAPIAgent(),
      new ReviewerAgent(),
    ];
  }

  async run(): Promise<void> {
    console.log(chalk.bold.cyan('\n🔬 QA Orchestrator — Multi-Agent Pipeline\n'));
    console.log(chalk.gray(`  Model: ${this.options.model}`));
    console.log(chalk.gray(`  Project: ${this.options.projectRoot}`));
    console.log(chalk.gray(`  InvenTree: ${this.options.inventreeUrl}`));
    console.log(chalk.gray(`  Dry run: ${this.options.dryRun}`));
    console.log('');

    const phases = [1, 2, 3, 4];
    const targetPhase = this.options.phase;

    for (const phase of phases) {
      if (targetPhase && phase !== targetPhase) continue;

      console.log(chalk.bold.yellow(`\n━━━ Phase ${phase}: ${this.getPhaseName(phase)} ━━━\n`));

      const phaseAgents = this.agents.filter(a => a.config.phase === phase);
      for (const agent of phaseAgents) {
        await this.runAgent(agent);
      }
    }

    console.log(chalk.bold.green('\n✅ Orchestration complete!\n'));
    this.printSummary();
  }

  private async runAgent(agent: Agent): Promise<void> {
    const spinner = ora({
      text: `${agent.config.name}: ${agent.config.description}`,
      color: 'cyan',
    }).start();

    try {
      // Load system prompt
      const systemPromptPath = path.join(
        this.options.projectRoot,
        'orchestrator',
        agent.config.systemPromptFile,
      );
      const systemPrompt = await fs.readFile(systemPromptPath, 'utf-8');

      // Build context from previous results
      const context: AgentContext = {
        previousOutputs: Object.fromEntries(
          [...this.results.entries()].map(([name, result]) => [name, result.output]),
        ),
        projectRoot: this.options.projectRoot,
        inventreeUrl: this.options.inventreeUrl,
      };

      // Build user prompt
      const userPrompt = agent.buildPrompt(context);

      // Run Claude
      const { output, durationMs } = await this.runner.run(
        agent.config,
        systemPrompt,
        userPrompt,
      );

      // Parse output into files
      const outputFiles = agent.parseOutput(output);

      // Write output files
      for (const file of outputFiles) {
        const fullPath = path.join(this.options.projectRoot, file.path);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, file.content, 'utf-8');
      }

      // Store result
      const result: AgentResult = {
        agentName: agent.config.name,
        phase: agent.config.phase,
        output,
        outputFiles,
        durationMs,
        timestamp: new Date().toISOString(),
        success: true,
      };
      this.results.set(agent.config.name, result);

      spinner.succeed(
        `${agent.config.name} — ${outputFiles.length} file(s) generated (${(durationMs / 1000).toFixed(1)}s)`,
      );
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      spinner.fail(`${agent.config.name} — FAILED: ${errMsg}`);

      this.results.set(agent.config.name, {
        agentName: agent.config.name,
        phase: agent.config.phase,
        output: '',
        outputFiles: [],
        durationMs: 0,
        timestamp: new Date().toISOString(),
        success: false,
        error: errMsg,
      });
    }
  }

  private getPhaseName(phase: number): string {
    const names: Record<number, string> = {
      1: 'Requirements Research',
      2: 'Test Case Design',
      3: 'Automation Code Generation',
      4: 'Code Review',
    };
    return names[phase] || `Phase ${phase}`;
  }

  private printSummary(): void {
    console.log(chalk.bold('\n📊 Pipeline Summary:\n'));

    const table: string[] = [];
    for (const [name, result] of this.results) {
      const status = result.success ? chalk.green('✅') : chalk.red('❌');
      const files = result.outputFiles.length;
      const duration = (result.durationMs / 1000).toFixed(1);
      table.push(`  ${status} ${name.padEnd(25)} ${String(files).padStart(3)} files  ${duration}s`);
    }

    console.log(table.join('\n'));

    const totalFiles = [...this.results.values()].reduce((sum, r) => sum + r.outputFiles.length, 0);
    const totalTime = [...this.results.values()].reduce((sum, r) => sum + r.durationMs, 0);
    const failedCount = [...this.results.values()].filter(r => !r.success).length;

    console.log(chalk.gray(`\n  Total: ${totalFiles} files, ${(totalTime / 1000).toFixed(1)}s`));
    if (failedCount > 0) {
      console.log(chalk.red(`  Failed: ${failedCount} agent(s)`));
    }
  }
}
