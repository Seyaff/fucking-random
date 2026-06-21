import Redis from "ioredis";
import { Env } from "../config/app.config";

class RedisService {
    public client: Redis | null = null;
    private connected = false;

    async connect(): Promise<boolean> {
        try {
            this.client = new Redis(Env.REDIS_URL, {
                maxRetriesPerRequest: null,
                retryStrategy: (times) => Math.min(times * 100, 3000),
                lazyConnect: true,
            });

            await this.client.ping();
            this.connected = true;
            console.log("[redis] Connected");

            this.client.on("error", (err) => {
                console.error("[redis] Error:", err.message);
            });

            return true;
        } catch (err: any) {
            console.warn("[redis] Not available — falling back to in-memory:", err.message);
            this.connected = false;
            this.client = null;
            return false;
        }
    }

    async get(key: string): Promise<string | null> {
        if (!this.client) return null;
        try {
            return await this.client.get(key);
        } catch {
            return null;
        }
    }

    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (!this.client) return;
        try {
            if (ttl) {
                await this.client.set(key, value, "EX", ttl);
            } else {
                await this.client.set(key, value);
            }
        } catch {}
    }

    async del(key: string): Promise<void> {
        if (!this.client) return;
        try {
            await this.client.del(key);
        } catch {}
    }

    get isAvailable(): boolean {
        return this.connected && this.client !== null;
    }
}

export const redisService = new RedisService();
