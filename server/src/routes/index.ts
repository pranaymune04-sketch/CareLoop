import { Router } from 'express';
import { createHealthRouter } from './health.routes';
import { createReferralRouter } from './referral.routes';
import { createFacilityRouter } from './facility.routes';
import { createPatientRouter } from './patient.routes';
import { IReferralRepository } from '../repositories/referral.repository';
import { IFacilityRepository } from '../repositories/facility.repository';
import { IPatientRepository } from '../repositories/patient.repository';

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
