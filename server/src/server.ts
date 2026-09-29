import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;
const app = createApp();

const server = app.listen(PORT, () => {
  console.log(`[CareLoop Backend Engine] Listening on http://localhost:${PORT}`);
  console.log(`[CareLoop Health Check] http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  console.log('[CareLoop Backend Engine] Shutting down gracefully...');
  server.close(() => {
    console.log('[CareLoop Backend Engine] Server closed.');
    process.exit(0);
  });
});
