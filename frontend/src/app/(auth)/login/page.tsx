import { GoogleButton } from "@/components/auth/google-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground text-lg font-bold">
            R
          </div>
          <h1 className="text-xl font-bold">Welcome back to Relay</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your Google account to continue
          </p>
        </div>

        <GoogleButton />

        <p className="text-xs text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/signin" className="underline hover:text-foreground">
            Create one
          </a>
        </p>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
