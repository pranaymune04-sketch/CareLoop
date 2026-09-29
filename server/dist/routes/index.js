import { Router } from 'express';
import { createHealthRouter } from './health.routes.js';
import { createReferralRouter } from './referral.routes.js';
import { createFacilityRouter } from './facility.routes.js';
import { createPatientRouter } from './patient.routes.js';
export const createApiRouter = (repos) => {
    const apiRouter = Router();
    apiRouter.use(createHealthRouter());
    apiRouter.use(createReferralRouter(repos.referralRepo, repos.facilityRepo, repos.patientRepo));
    apiRouter.use(createFacilityRouter(repos.facilityRepo));
    apiRouter.use(createPatientRouter(repos.patientRepo));
    return apiRouter;
};
