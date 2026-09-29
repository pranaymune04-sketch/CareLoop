import { Request, Response, NextFunction } from 'express';
import { ActorContext, UserRole } from '../types/index';

declare global {
  namespace Express {
    interface Request {
      actor?: ActorContext;
    }
  }
}

export const actorContextMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const role = req.headers['x-actor-role'] as UserRole | undefined;
  const actorId = req.headers['x-actor-id'] as string | undefined;
  const actorName = req.headers['x-actor-name'] as string | undefined;
  const facilityId = req.headers['x-facility-id'] as string | undefined;

  req.actor = {
    role: role || (req.body?.actorRole as UserRole) || undefined,
    actorId: actorId || (req.body?.actorId as string) || undefined,
    actorName: actorName || (req.body?.actorName as string) || undefined,
    facilityId: facilityId || (req.body?.facilityId as string) || undefined,
  };

  next();
};
