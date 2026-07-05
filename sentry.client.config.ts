import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://727c73fa73f328f4cc14d5462fa1fb20@o4508496464871424.ingest.us.sentry.io/4508496470048768", // Mock DSN, the wizard will replace this if ran later
  tracesSampleRate: 1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
