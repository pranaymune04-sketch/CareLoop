import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller.js';
import { PatientService } from '../services/patient.service.js';
import { IPatientRepository } from '../repositories/patient.repository.js';

export const createPatientRouter = (patientRepo: IPatientRepository): Router => {
  const router = Router();
  const service = new PatientService(patientRepo);
  const controller = new PatientController(service);

  router.get('/patients', controller.getPatients);
  router.get('/patients/:id', controller.getPatientById);

  return router;
};
