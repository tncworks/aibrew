import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env', override: false });

process.env.TZ = 'Asia/Tokyo';
jest.setTimeout(30000);
