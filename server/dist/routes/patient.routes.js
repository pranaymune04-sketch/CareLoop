import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { PatientService } from '../services/patient.service';
export const createPatientRouter = (patientRepo) => {
    const router = Router();
    const service = new PatientService(patientRepo);
    const controller = new PatientController(service);
    router.get('/patients', controller.getPatients);
    router.get('/patients/:id', controller.getPatientById);
    return router;
};
