/** Orchestrator type definitions */

export interface AgentConfig {
  name: string;
  description: string;
  phase: number;
  systemPromptFile: string;
}

export interface AgentContext {
  /** Previous agent outputs keyed by agent name */
  previousOutputs: Record<string, string>;
  /** Project root directory */
  projectRoot: string;
  /** Base URL of InvenTree instance */
  inventreeUrl: string;
}

export interface AgentResult {
  agentName: string;
  phase: number;
  output: string;
  outputFiles: OutputFile[];
  durationMs: number;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface OutputFile {
  path: string;
  content: string;
}

export interface AILogEntry {
  timestamp: string;
  agentName: string;
  phase: number;
  prompt: string;
  systemPrompt: string;
  response: string;
  durationMs: number;
  success: boolean;
  error?: string;
  estimatedTokens: {
    input: number;
    output: number;
  };
}

export interface OrchestratorOptions {
  /** Run specific phase only */
  phase?: number;
  /** Show prompts without calling Claude */
  dryRun: boolean;
  /** Show full Claude output in console */
  verbose: boolean;
  /** Skip Docker health check */
  skipSetup: boolean;
  /** Project root directory */
  projectRoot: string;
  /** InvenTree base URL */
  inventreeUrl: string;
  /** Model to use for Claude CLI */
  model: string;
}

export interface Agent {
  config: AgentConfig;
  buildPrompt(context: AgentContext): string;
  parseOutput(raw: string): OutputFile[];
}
