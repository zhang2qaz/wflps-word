#!/usr/bin/env node
// 把 Vosk 中文小模型下载到 public/models/,让 App 同源加载,
// 从而首次使用也不联任何外部域。
// 幂等:文件已存在直接跳过。
//
// HF Docker 构建会执行这一步,把 42MB 模型烤进镜像;
// 本地开发跑 npm run dev 前可手动 npm run fetch-model 一次。

import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_NAME = 'vosk-model-small-cn-0.3.tar.gz';
const MODEL_PATH = join(ROOT, 'public', 'models', MODEL_NAME);
const MODEL_URL = `https://ccoreilly.github.io/vosk-browser/models/${MODEL_NAME}`;
const MIN_BYTES = 30 * 1024 * 1024; // 30MB 起步,小于这个数当下载坏了

async function main() {
  if (existsSync(MODEL_PATH)) {
    const sz = statSync(MODEL_PATH).size;
    if (sz >= MIN_BYTES) {
      console.log(`✓ Vosk 中文模型已就位 (${(sz / 1024 / 1024).toFixed(1)} MB) —— 跳过下载`);
      return;
    }
    console.warn(`⚠ 现有模型文件太小 (${sz} B),重新下载`);
  }

  mkdirSync(dirname(MODEL_PATH), { recursive: true });
  console.log(`↓ 下载 ${MODEL_URL}`);
  console.log('  (约 42 MB,首次构建需要 30-60 秒,以后镜像缓存就快了)');

  const t0 = Date.now();
  const ok = tryDownload(MODEL_URL, MODEL_PATH);
  if (ok) {
    const sz = statSync(MODEL_PATH).size;
    if (sz < MIN_BYTES) {
      try { unlinkSync(MODEL_PATH); } catch {}
      console.warn(`⚠ 下载文件太小 (${sz} B),已删除。语音功能会失效。`);
      return;
    }
    console.log(`✓ 下载完成 ${(sz / 1024 / 1024).toFixed(1)} MB, 用时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } else {
    console.warn('⚠ curl 和 wget 都不可用 / 下载都失败 —— 语音输入功能会显示「模型未就位」');
    console.warn('  之后可以重新跑 npm run fetch-model 重试。');
  }
}

// 用 curl 或 wget 下载,二选一,哪个能成用哪个。
// Node fetch 在某些环境 ECONNRESET,shell 工具反而更稳。
function tryDownload(url, dest) {
  // curl
  try {
    execFileSync('curl', ['-fsSL', '--retry', '3', '--retry-delay', '2', '-o', dest, url], {
      stdio: ['ignore', 'inherit', 'inherit'],
      timeout: 180_000,
    });
    return true;
  } catch (e) {
    console.warn(`  curl 失败:${(e instanceof Error ? e.message : String(e)).split('\n')[0]}`);
  }
  // wget
  try {
    execFileSync('wget', ['-q', '--tries=3', '-O', dest, url], {
      stdio: ['ignore', 'inherit', 'inherit'],
      timeout: 180_000,
    });
    return true;
  } catch (e) {
    console.warn(`  wget 失败:${(e instanceof Error ? e.message : String(e)).split('\n')[0]}`);
  }
  return false;
}

main();
