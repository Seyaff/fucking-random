import "dotenv/config"
import dns from "dns"

import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import { Env } from "./config/app.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import "./config/passport.config"
import authRoutes from "./modules/auth/auth.routes"
import conversationRoutes from "./modules/conversation/conversation.routes"
import whatsappRoutes from "./modules/whatsapp/whatsapp.routes"

dns.setServers(["1.1.1.1" , "8.8.8.8"])

const app = express()



app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cookieParser())
app.use(cors({
    origin : [Env.FRONTEND_ORIGIN],
    credentials : true
}))
app.use(passport.initialize())

app.use(`${Env.BASE_PATH}/conversations` , conversationRoutes )
app.use(`${Env.BASE_PATH}/whatsapp` , whatsappRoutes )
app.use(`${Env.BASE_PATH}/auth`, authRoutes)


app.use(errorHandler)


export default app