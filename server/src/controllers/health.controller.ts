import { Request, Response } from 'express';
import { ApiResponse } from '../types/api.js';

export class HealthController {
  getHealth = (_req: Request, res: Response): void => {
    const response: ApiResponse<{
      service: string;
      status: string;
      uptimeSeconds: number;
      mode: string;
    }> = {
      success: true,
      data: {
        service: 'CareLoop Backend Coordination Engine',
        status: 'ok',
        uptimeSeconds: Math.floor(process.uptime()),
        mode: 'in-memory-repository',
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    res.status(200).json(response);
  }
}
