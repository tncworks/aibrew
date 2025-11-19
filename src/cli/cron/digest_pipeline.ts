#!/usr/bin/env node

import process from 'process';
import { loadConfig } from '../../services/config/index.js';
import { info, error as logError } from '../../services/observability/logging.js';
import { runFetchSources } from './jobs/fetch_sources.js';
import { runSummarize } from './jobs/summarize_articles.js';
import { runPublish } from './jobs/publish_digest.js';

type Stage = {
  name: string;
  run: (slot: string) => Promise<void>;
};

const stages: Stage[] = [
  { name: 'fetch_sources', run: runFetchSources },
  { name: 'summarize_articles', run: runSummarize },
  { name: 'publish_digest', run: runPublish },
];

function parseSlot(): string {
  const arg = process.argv.find((value) => value.startsWith('--slot='));
  if (arg) {
    return arg.split('=')[1];
  }
  return process.env.DIGEST_SLOT ?? '0530';
}

async function main() {
  const slot = parseSlot();
  const cfg = loadConfig();

  if (!cfg.scheduler.slots.includes(slot)) {
    throw new Error(`無効なスロット指定です: ${slot}`);
  }

  info('digest_pipeline_start', { slot });

  for (const stage of stages) {
    try {
      info(`stage_start_${stage.name}`, { slot });
      await stage.run(slot);
      info(`stage_complete_${stage.name}`, { slot });
    } catch (err) {
      logError(`stage_failed_${stage.name}`, {
        slot,
        error: err instanceof Error ? err.message : err,
      });
      throw err;
    }
  }

  info('digest_pipeline_complete', { slot });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
