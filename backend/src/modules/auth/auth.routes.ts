import { Router } from "express";
import passport from "passport";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { Env } from "../../config/app.config";

const authController = new AuthController();
const authRoutes = Router();

authRoutes.get(
    "/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
);

authRoutes.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${Env.FRONTEND_ORIGIN}/login?error=oauth_failed`,
    }),
    authController.googleCallback
);

authRoutes.post("/refresh", authController.refresh);

authRoutes.post("/logout", authController.logout);

authRoutes.get("/me", authenticate, authController.getMe);

export default authRoutes;
