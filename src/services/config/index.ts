import fs from 'fs';
import path from 'path';
import { z } from 'zod';

let envLoaded = false;

function loadLocalEnv() {
  if (envLoaded) return;
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.trim().startsWith('#')) continue;
      const [key, ...rest] = line.split('=');
      if (!key || rest.length === 0) continue;
      const value = rest.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  }
  envLoaded = true;
}

loadLocalEnv();

const schedulerSlotSchema = z.enum(['0530', '0600', '0630']).or(z.string());

const envFileSchema = z.object({
  name: z.string(),
  firestoreProject: z.string(),
  vertex: z.object({
    project: z.string(),
    location: z.string(),
    summaryModel: z.string(),
    factCheckModel: z.string(),
  }),
  cloudRun: z.object({
    region: z.string(),
    services: z.object({
      web: z.string(),
    }),
    jobs: z.object({
      crawler: z.string(),
      summarize: z.string(),
      publish: z.string(),
    }),
  }),
  scheduler: z.object({
    slots: z.array(schedulerSlotSchema),
    timezone: z.string(),
  }),
  observability: z.object({
    logName: z.string(),
    metricsPrefix: z.string(),
  }),
});

export type EnvironmentFile = z.infer<typeof envFileSchema>;

export type AppConfig = EnvironmentFile & {
  firestore: {
    emulatorHost?: string;
    projectId: string;
  };
  vertexRuntime: {
    maxSummariesPerDay: number;
  };
  slack: {
    alertWebhook?: string;
  };
};

let cachedConfig: AppConfig | null = null;

const defaultEnvName =
  process.env.AIBREW_ENV ||
  process.env.NODE_ENV ||
  process.env.ENV ||
  'dev';

function resolveEnvPath(envName: string) {
  return path.resolve(
    process.cwd(),
    'config',
    'environments',
    `${envName}.json`,
  );
}

export function loadConfig(envName: string = defaultEnvName): AppConfig {
  if (cachedConfig && cachedConfig.name === envName) {
    return cachedConfig;
  }

  const filePath = resolveEnvPath(envName);
  if (!fs.existsSync(filePath)) {
    if (envName !== 'dev') {
      return loadConfig('dev');
    }
    throw new Error(`環境ファイルが見つかりません: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = envFileSchema.parse(JSON.parse(raw));

  const config: AppConfig = {
    ...parsed,
    firestore: {
      emulatorHost: process.env.FIRESTORE_EMULATOR_HOST,
      projectId: process.env.FIRESTORE_PROJECT_ID ?? parsed.firestoreProject,
    },
    vertexRuntime: {
      maxSummariesPerDay: Number(
        process.env.VERTEXAI_MAX_SUMMARIES_PER_DAY ?? '30',
      ),
    },
    slack: {
      alertWebhook: process.env.SLACK_ALERT_WEBHOOK,
    },
  };

  cachedConfig = config;
  return config;
}

export function resetConfigCache() {
  cachedConfig = null;
}
