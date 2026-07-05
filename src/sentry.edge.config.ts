import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://85b7e30a2bf99e12473e1fcbea477dde@o4511644539355136.ingest.de.sentry.io/4511644542369872",
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
});
