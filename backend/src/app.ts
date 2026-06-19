import "dotenv/config"
import dns from "dns"

import express, { Request, Response } from "express"
import cors from "cors"
import { Env } from "./config/app.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes"

dns.setServers(["1.1.1.1" , "8.8.8.8"])

const app = express()



app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors({
    origin : [Env.FRONTEND_ORIGIN],
    credentials : true
}))


app.get(`${Env.BASE_PATH}/whatsapp` , whatsappRoutes )


app.use(errorHandler)


export default app