#!/usr/bin/env node
/**
 * QA Orchestrator CLI — Multi-agent AI pipeline for InvenTree QA.
 *
 * Usage:
 *   npx tsx orchestrator/src/index.ts [options]
 *
 * Options:
 *   --phase <n>     Run specific phase only (1=Research, 2=TestDesign, 3=CodeGen, 4=Review)
 *   --dry-run       Show prompts without calling Claude
 *   --verbose       Show full Claude output in console
 *   --skip-setup    Skip Docker/InvenTree health check
 *   --model <name>  Claude model to use (default: sonnet)
 *   --url <url>     InvenTree base URL (default: http://localhost:8080)
 */
import path from 'path';
import chalk from 'chalk';
import { Orchestrator } from './orchestrator.js';
import type { OrchestratorOptions } from './types.js';

function parseArgs(args: string[]): OrchestratorOptions {
  const projectRoot = path.resolve(process.cwd());

  const options: OrchestratorOptions = {
    dryRun: false,
    verbose: false,
    skipSetup: false,
    projectRoot,
    inventreeUrl: 'http://localhost:8080',
    model: 'sonnet',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--phase':
        options.phase = parseInt(args[++i], 10);
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--skip-setup':
        options.skipSetup = true;
        break;
      case '--model':
        options.model = args[++i];
        break;
      case '--url':
        options.inventreeUrl = args[++i];
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
${chalk.bold.cyan('QA Orchestrator')} — Multi-agent AI pipeline for InvenTree QA

${chalk.bold('Usage:')}
  npx tsx orchestrator/src/index.ts [options]

${chalk.bold('Options:')}
  --phase <n>     Run specific phase only
                    1 = Requirements Research
                    2 = Test Case Design
                    3 = Automation Code Generation
                    4 = Code Review
  --dry-run       Show prompts without calling Claude
  --verbose       Show full Claude output in console
  --skip-setup    Skip Docker/InvenTree health check
  --model <name>  Claude model (default: sonnet)
  --url <url>     InvenTree URL (default: http://localhost:8080)
  --help          Show this help

${chalk.bold('Examples:')}
  npx tsx orchestrator/src/index.ts                    # Full pipeline
  npx tsx orchestrator/src/index.ts --phase 1          # Research only
  npx tsx orchestrator/src/index.ts --dry-run          # Preview prompts
  npx tsx orchestrator/src/index.ts --model opus       # Use Opus model

${chalk.bold('Pipeline Phases:')}
  Phase 1: Research Agent parses InvenTree docs → requirements.md
  Phase 2: Test Design agents → UI/API manual test cases + RTM
  Phase 3: Code Gen agents → Playwright UI/API automation
  Phase 4: Review Agent → code quality review report

${chalk.gray('Note: This orchestrator uses claude -p (Claude CLI pipe mode).')}
${chalk.gray('For API-based execution, replace ClaudeRunner with an API client.')}
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  console.log(chalk.bold.cyan(`
  ╔══════════════════════════════════════════════════╗
  ║   QAHub AI Hackathon 2026 — QA Orchestrator     ║
  ║   Multi-Agent Pipeline for InvenTree Parts QA    ║
  ╚══════════════════════════════════════════════════╝
  `));

  const orchestrator = new Orchestrator(options);
  await orchestrator.run();
}

main().catch((error) => {
  console.error(chalk.red('\n❌ Orchestrator failed:'), error.message);
  process.exit(1);
});
