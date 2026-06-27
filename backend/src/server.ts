import app from "./app"
import http from "http"
import { Env } from "./config/app.config"
import connectDatabase from "./config/database.config"
import { startWorker } from "./lib/worker"
import { redisService } from "./lib/redis"

process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("[FATAL] Uncaught Exception:", err);
    // Give logger time to flush, then exit
    setTimeout(() => process.exit(1), 1000);
});

const server = http.createServer(app)

server.listen(Env.PORT , async () => {
    console.log("Server running")
    await connectDatabase()
    await redisService.connect()
    startWorker()
    console.log("Worker started")
})


