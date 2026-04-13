import type { OutputFile } from '../types.js';

/**
 * Parse output from Claude that contains file blocks in the format:
 * --- FILE: path/to/file ---
 * (content)
 * --- END FILE ---
 */
export function parseFileBlocks(raw: string): OutputFile[] {
  const files: OutputFile[] = [];
  const regex = /---\s*FILE:\s*(.+?)\s*---\n([\s\S]*?)---\s*END FILE\s*---/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    const filePath = match[1].trim();
    const content = match[2].trim();
    files.push({ path: filePath, content });
  }

  return files;
}

/**
 * Extract content between markdown code fences.
 */
export function extractCodeBlocks(raw: string): Array<{ language: string; content: string }> {
  const blocks: Array<{ language: string; content: string }> = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      content: match[2].trim(),
    });
  }

  return blocks;
}
