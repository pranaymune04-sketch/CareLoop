import { Request, Response, NextFunction } from 'express';
import { FacilityService } from '../services/facility.service.js';
import { ApiResponse, MatchedFacilityResult } from '../types/api.js';
import { Facility } from '../types/index.js';

export class FacilityController {
  constructor(private facilityService: FacilityService) {}

  getFacilities = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const facilities = await this.facilityService.getAllFacilities();
      const response: ApiResponse<Facility[]> = {
        success: true,
        data: facilities,
        meta: {
          timestamp: new Date().toISOString(),
          count: facilities.length,
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  getFacilityById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const facility = await this.facilityService.getFacilityById(id);
      const response: ApiResponse<Facility> = {
        success: true,
        data: facility,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  matchFacilities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { department, emergency, maxDistanceKm, requireIcu } = req.query;

      const criteria = {
        department: (department as string) || 'General Medicine & OPD',
        emergency: emergency === 'true' || emergency === '1',
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
        requireIcu: requireIcu === 'true' || requireIcu === '1',
      };

      const matched = await this.facilityService.matchFacilities(criteria);
      const response: ApiResponse<MatchedFacilityResult[]> = {
        success: true,
        data: matched,
        meta: {
          timestamp: new Date().toISOString(),
          count: matched.length,
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  updateCapacity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.facilityService.updateCapacity(id, req.body);
      const response: ApiResponse<Facility> = {
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
