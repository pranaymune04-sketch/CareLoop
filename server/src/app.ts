import express, { Express } from 'express';
import cors from 'cors';
import { createApiRouter, AppRepositories } from './routes/index.js';
import { actorContextMiddleware } from './middleware/actorContext.js';
import { errorHandler } from './middleware/errorHandler.js';
import { InMemoryReferralRepository } from './repositories/referral.repository.js';
import { InMemoryFacilityRepository } from './repositories/facility.repository.js';
import { InMemoryPatientRepository } from './repositories/patient.repository.js';

export interface AppOptions {
  repositories?: Partial<AppRepositories>;
}

export const createApp = (options: AppOptions = {}): Express => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true, // Automatically allow requested origin (useful for local dev and Vercel preview/production URLs)
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-actor-role', 'x-actor-id', 'x-actor-name', 'x-facility-id'],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(actorContextMiddleware);

  // Repositories
  const repositories: AppRepositories = {
    referralRepo: options.repositories?.referralRepo || new InMemoryReferralRepository(),
    facilityRepo: options.repositories?.facilityRepo || new InMemoryFacilityRepository(),
    patientRepo: options.repositories?.patientRepo || new InMemoryPatientRepository(),
  };

  // Mount API router
  app.use('/api', createApiRouter(repositories));

  // Fallback 404 handler for undefined API routes
  app.use('/api', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ENDPOINT_NOT_FOUND',
        message: 'The requested API route does not exist.',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
