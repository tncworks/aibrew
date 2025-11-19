import {
  VertexAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google-cloud/vertexai';
import { loadConfig } from '../config/index';

const cfg = loadConfig();

const mockMode = process.env.AIBREW_MOCK_LLM === '1';

const vertex = mockMode
  ? null
  : new VertexAI({
      project: cfg.vertex.project,
      location: cfg.vertex.location,
    });

const generativeModel = vertex
  ? vertex.preview.getGenerativeModel({
      model: cfg.vertex.summaryModel ?? cfg.vertex.summaryModel,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    })
  : null;

const factCheckModel = vertex
  ? vertex.preview.getGenerativeModel({
      model: cfg.vertex.factCheckModel ?? 'gemini-pro',
    })
  : null;

const minIntervalMs = Math.ceil(
  (24 * 60 * 60 * 1000) / Math.max(cfg.vertexRuntime.maxSummariesPerDay, 1),
);

class RateLimiter {
  private lastRun = 0;

  async wait() {
    const now = Date.now();
    const waitMs = Math.max(0, this.lastRun + minIntervalMs - now);
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    this.lastRun = Date.now();
  }
}

const limiter = new RateLimiter();

export interface SummarizeOptions {
  temperature?: number;
  maxOutputTokens?: number;
}

async function runWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt >= retries) throw error;
      const wait = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
}

export async function generateSummary(
  prompt: string,
  options: SummarizeOptions = {},
) {
  if (mockMode || !generativeModel) {
    return `[MOCK SUMMARY] ${prompt.slice(0, 100)}`;
  }
  await limiter.wait();
  const result = await runWithRetry(() =>
    generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 256,
      },
    }),
  );

  const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Vertex AI から要約を取得できませんでした');
  return text.trim();
}

export async function factCheckSummary(prompt: string) {
  if (mockMode || !factCheckModel) {
    return '[MOCK FACT CHECK]';
  }
  await limiter.wait();
  const result = await runWithRetry(() =>
    factCheckModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  );
  return result.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
}
