import { Router } from 'express';
import { createHealthRouter } from './health.routes';
import { createReferralRouter } from './referral.routes';
import { createFacilityRouter } from './facility.routes';
import { createPatientRouter } from './patient.routes';
export const createApiRouter = (repos) => {
    const apiRouter = Router();
    apiRouter.use(createHealthRouter());
    apiRouter.use(createReferralRouter(repos.referralRepo, repos.facilityRepo, repos.patientRepo));
    apiRouter.use(createFacilityRouter(repos.facilityRepo));
    apiRouter.use(createPatientRouter(repos.patientRepo));
    return apiRouter;
};
