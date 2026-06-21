import app from "./app"
import http from "http"
import { Env } from "./config/app.config"
import connectDatabase from "./config/database.config"
import { startWorker } from "./lib/worker"
import { redisService } from "./lib/redis"


const server = http.createServer(app)

server.listen(Env.PORT , async () => {
    console.log("Server running")
    await connectDatabase()
    await redisService.connect()
    startWorker()
    console.log("Worker started")
})


