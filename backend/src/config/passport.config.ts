import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Env } from "./app.config";
import { AuthService } from "../modules/auth/auth.service";

const authService = new AuthService();

passport.use(
    new GoogleStrategy(
        {
            clientID: Env.GOOGLE_CLIENT_ID,
            clientSecret: Env.GOOGLE_CLIENT_SECRET,
            callbackURL: Env.GOOGLE_CALLBACK_URL,
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const email = profile.emails?.[0]?.value;

                if (!email) {
                    return done(new Error("Google account has no public email"));
                }

                const photoUrl = profile.photos?.[0]?.value;

                const user = await authService.loginOrSignupWithProvider({
                    provider: "google",
                    providerAccountId: profile.id,
                    email,
                    name: profile.displayName,
                    ...(photoUrl ? { avatarUrl: photoUrl } : {}),
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

export default passport;
