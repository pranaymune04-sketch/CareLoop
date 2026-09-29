import { Router } from 'express';
import { createHealthRouter } from './health.routes.js';
import { createReferralRouter } from './referral.routes.js';
import { createFacilityRouter } from './facility.routes.js';
import { createPatientRouter } from './patient.routes.js';
import { IReferralRepository } from '../repositories/referral.repository.js';
import { IFacilityRepository } from '../repositories/facility.repository.js';
import { IPatientRepository } from '../repositories/patient.repository.js';

export interface AppRepositories {
  referralRepo: IReferralRepository;
  facilityRepo: IFacilityRepository;
  patientRepo: IPatientRepository;
}

export const createApiRouter = (repos: AppRepositories): Router => {
  const apiRouter = Router();

  apiRouter.use(createHealthRouter());
  apiRouter.use(createReferralRouter(repos.referralRepo, repos.facilityRepo, repos.patientRepo));
  apiRouter.use(createFacilityRouter(repos.facilityRepo));
  apiRouter.use(createPatientRouter(repos.patientRepo));

  return apiRouter;
};
