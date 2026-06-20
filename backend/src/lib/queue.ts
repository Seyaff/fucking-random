import { Queue, Worker } from "bullmq";
import { Env } from "../config/app.config";

const connection = {
    url: Env.REDIS_URL,
};

export const messageQueue = new Queue("whatsapp-messages", {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 3600 },
        removeOnFail: { age: 86400 },
    },
});

export function createWorker(
    processor: (job: any) => Promise<void>
) {
    const worker = new Worker("whatsapp-messages", processor, {
        connection,
        concurrency: 5,
    });

    worker.on("completed", (job) => {
        console.log(`Job ${job.id} completed`);
    });

    worker.on("failed", (job, err) => {
        console.error(`Job ${job?.id} failed:`, err.message);
    });

    return worker;
}
