import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

export const REPO_DIR = path.resolve(fileURLToPath(import.meta.url), '../../../');

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function exec(cmd: string): string {
  return execSync(cmd, { cwd: REPO_DIR, encoding: 'utf-8' }).trim();
}
