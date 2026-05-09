import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, FormEvent } from "react";

// lucide-react removed brand icons in v0.500+ — inline SVGs keep the component
// dependency-light and avoid trademark issues.
type IconProps = ComponentProps<'svg'>;

const GoogleIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.35 11.1H12v2.96h5.35c-.23 1.5-1.74 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.96S8.78 6.54 12 6.54c1.84 0 3.07.78 3.77 1.45l2.57-2.49C16.66 3.99 14.55 3.05 12 3.05 6.98 3.05 2.92 7.11 2.92 12.13S6.98 21.21 12 21.21c6.92 0 9.49-4.86 9.49-7.36 0-.5-.05-.88-.14-1.25z"/>
  </svg>
);
const TwitterIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/>
  </svg>
);
const GithubIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.72-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.55-1.13-4.55-5.04 0-1.11.39-2.02 1.03-2.74-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.74 0 3.92-2.34 4.78-4.57 5.03.36.32.68.94.68 1.91 0 1.38-.01 2.49-.01 2.83 0 .27.18.59.69.49C19.14 20.61 22 16.78 22 12.25 22 6.59 17.52 2 12 2Z"/>
  </svg>
);

const socialProviders = [
  { name: "Google",  icon: GoogleIcon  },
  { name: "Twitter", icon: TwitterIcon },
  { name: "GitHub",  icon: GithubIcon  },
];

export function GlassSignInCard() {
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
      }}
      className="group w-full max-w-lg rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-10 relative"
      role="form"
      aria-labelledby="glass-sign-in-title"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"
      />
      <div className="mb-8 space-y-2 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Sign In
        </div>
        <h1
          id="glass-sign-in-title"
          className="text-2xl font-semibold text-foreground sm:text-3xl"
        >
          Access your workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a social account or continue with email and password.
        </p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {socialProviders.map((provider) => (
          <Button
            key={provider.name}
            variant="outline"
            className="flex items-center justify-center gap-2 rounded-full border-border/60 bg-card/70 text-sm text-foreground transition-transform duration-300 hover:-translate-y-1 hover:text-primary"
            aria-label={`Continue with ${provider.name}`}
          >
            <provider.icon className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{provider.name}</span>
          </Button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border/70" />
        <span className="text-xs uppercase tracking-[0.34em] text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border/70" />
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <label className="flex items-center gap-2">
            <Checkbox id="remember-me" />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[0_20px_60px_-30px_rgba(79,70,229,0.75)] transition-transform duration-300 hover:-translate-y-1"
        >
          Continue with Email
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our terms of service and privacy policy.
      </p>
    </motion.div>
  );
}
