// Entry packager untuk bounty make.fun (Node 22+, pustaka standar saja).
// Menyalin game/ dan screenshots/ ke MAKEFUN_OUTPUT_DIR (default /output)
// lalu menulis dossier.json menggunakan buildDossier dari vendor/makefun-game.ts.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
};

function copyPlainTree(srcDir: string, destDir: string): number {
  if (!existsSync(srcDir) || !statSync(srcDir).isDirectory()) {
    throw new Error(`Direktori sumber tidak ditemukan: ${srcDir}`);
  }
  rmSync(destDir, { recursive: true, force: true });
  mkdirSync(destDir, { recursive: true });

  let copiedFiles = 0;
  const entries = readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const from = join(srcDir, entry.name);
    const to = join(destDir, entry.name);
    if (entry.isDirectory()) {
      copiedFiles += copyPlainTree(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
      copiedFiles += 1;
    }
  }
  return copiedFiles;
}

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const gameFiles = copyPlainTree(join(REPO_ROOT, 'game'), join(OUTPUT_DIR, 'game'));
  const shotFiles = copyPlainTree(join(REPO_ROOT, 'screenshots'), join(OUTPUT_DIR, 'screenshots'));

  const dossierBytes = buildDossier(OUTPUT_DIR, GATE_CAPS);
  const dossierPath = join(OUTPUT_DIR, 'dossier.json');
  writeFileSync(dossierPath, dossierBytes);

  console.log(
    `Packaged Warung Rush -> ${OUTPUT_DIR} (${gameFiles} game files, ${shotFiles} screenshots, dossier ${dossierBytes.length} bytes)`
  );
}

main();
