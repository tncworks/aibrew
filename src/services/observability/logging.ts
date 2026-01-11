import { Logging } from '@google-cloud/logging';
import { loadConfig } from '../config/index';

type LogSeverity =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARNING'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY';

const cfg = loadConfig();
const isLocalDev = !!cfg.firestore.emulatorHost || process.env.NODE_ENV === 'development';
const logging = new Logging({ projectId: cfg.firestore.projectId });
const log = logging.log(cfg.observability.logName);

export interface LogPayload {
  message: string;
  severity?: LogSeverity;
  data?: Record<string, unknown>;
}

export async function writeLog(payload: LogPayload) {
  // ローカル開発時はコンソールに出力
  if (isLocalDev) {
    const timestamp = new Date().toISOString();
    const severity = payload.severity ?? 'INFO';
    const dataStr = payload.data ? ` ${JSON.stringify(payload.data)}` : '';
    console.log(`[${timestamp}] [${severity}] ${payload.message}${dataStr}`);
    return;
  }

  const entry = log.entry(
    {
      severity: payload.severity ?? 'INFO',
      resource: { type: 'global', labels: { project_id: cfg.firestore.projectId } },
    },
    {
      message: payload.message,
      data: payload.data,
    },
  );

  try {
    await log.write(entry);
  } catch (error) {
    console.error('[observability] ログ送信に失敗しました', error);
  }
}

export function info(message: string, data?: Record<string, unknown>) {
  return writeLog({ message, data, severity: 'INFO' });
}

export function warn(message: string, data?: Record<string, unknown>) {
  return writeLog({ message, data, severity: 'WARNING' });
}

export function error(message: string, data?: Record<string, unknown>) {
  return writeLog({ message, data, severity: 'ERROR' });
}
