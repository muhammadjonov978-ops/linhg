// Upstash Redis client — to'lov buyurtmalarini (order) saqlash uchun.
// Vercel'da quyidagi env o'zgaruvchilar kerak (server-side, VITE_ PREFIKSISIZ!):
//   UPSTASH_REDIS_REST_URL=
//   UPSTASH_REDIS_REST_TOKEN=
// Upstash konsoli: https://console.upstash.com → Database → REST API bo'limi
import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || '';
const token = process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const redis = url && token ? new Redis({ url, token }) : null;
