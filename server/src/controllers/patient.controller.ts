import { Request, Response, NextFunction } from 'express';
import { PatientService } from '../services/patient.service.js';
import { ApiResponse } from '../types/api.js';
import { Patient } from '../types/index.js';

export class PatientController {
  constructor(private patientService: PatientService) {}

  getPatients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patients = await this.patientService.getAllPatients();
      const response: ApiResponse<Patient[]> = {
        success: true,
        data: patients,
        meta: {
          timestamp: new Date().toISOString(),
          count: patients.length,
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const patient = await this.patientService.getPatientById(id);
      const response: ApiResponse<Patient> = {
        success: true,
        data: patient,
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
