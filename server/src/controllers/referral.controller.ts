import { Request, Response, NextFunction } from 'express';
import { ReferralService } from '../services/referral.service';
import { ApiResponse } from '../types/api';
import { Referral, ReferralStatus, ReferralPriority, ReferralType } from '../types/index';

export class ReferralController {
  constructor(private referralService: ReferralService) {}

  getReferrals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, priority, referralType, targetFacilityId, referringWorkerId, patientId, atRisk } = req.query;

      const filter = {
        status: status as ReferralStatus | undefined,
        priority: priority as ReferralPriority | undefined,
        referralType: referralType as ReferralType | undefined,
        targetFacilityId: targetFacilityId as string | undefined,
        referringWorkerId: referringWorkerId as string | undefined,
        patientId: patientId as string | undefined,
        atRiskOnly: atRisk === 'true' || atRisk === '1',
      };

      const referrals = await this.referralService.getAllReferrals(filter);
      const response: ApiResponse<Referral[]> = {
        success: true,
        data: referrals,
        meta: {
          timestamp: new Date().toISOString(),
          count: referrals.length,
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  getReferralById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const referral = await this.referralService.getReferralById(id);
      const response: ApiResponse<Referral> = {
        success: true,
        data: referral,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  createReferral = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newReferral = await this.referralService.createReferral(req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: newReferral,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  acceptSlot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.referralService.acceptSlot(id, req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  proposeAlternativeSlot = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.referralService.proposeAlternativeSlot(id, req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  cannotProceed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.referralService.cannotProceed(id, req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  recordPatientArrival = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.referralService.recordPatientArrival(id, req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  startService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.referralService.startService(id, req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  completeService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.referralService.completeService(id, req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  rerouteReferral = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.referralService.rerouteReferral(id, req.body, req.actor);
      const response: ApiResponse<Referral> = {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };
}
