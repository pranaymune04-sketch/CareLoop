import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

export const createHealthRouter = (): Router => {
  const router = Router();
  const controller = new HealthController();

  router.get('/health', controller.getHealth);

  return router;
};
