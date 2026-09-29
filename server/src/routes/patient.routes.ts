import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { PatientService } from '../services/patient.service';
import { IPatientRepository } from '../repositories/patient.repository';

export const createPatientRouter = (patientRepo: IPatientRepository): Router => {
  const router = Router();
  const service = new PatientService(patientRepo);
  const controller = new PatientController(service);

  router.get('/patients', controller.getPatients);
  router.get('/patients/:id', controller.getPatientById);

  return router;
};
