import { MetricServiceClient } from '@google-cloud/monitoring';
import { loadConfig } from '../config/index';

const cfg = loadConfig();
const monitoringClient = new MetricServiceClient();

export interface MetricPoint {
  name: string;
  value: number;
  labels?: Record<string, string>;
  unit?: string;
}

export async function writeMetric(point: MetricPoint) {
  const projectPath = monitoringClient.projectPath(cfg.firestore.projectId);
  const series = {
    metric: {
      type: `${cfg.observability.metricsPrefix}/${point.name}`,
      labels: point.labels ?? {},
    },
    resource: {
      type: 'global',
      labels: { project_id: cfg.firestore.projectId },
    },
    points: [
      {
        interval: {
          endTime: { seconds: Date.now() / 1000 },
        },
        value: {
          doubleValue: point.value,
        },
      },
    ],
    unit: point.unit ?? '1',
  };

  try {
    await monitoringClient.createTimeSeries({
      name: projectPath,
      timeSeries: [series],
    });
  } catch (error) {
    console.error('[observability] メトリクス送信に失敗しました', error);
  }
}
