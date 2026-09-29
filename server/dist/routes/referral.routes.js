import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller.js';
import { ReferralService } from '../services/referral.service.js';
export const createReferralRouter = (referralRepo, facilityRepo, patientRepo) => {
    const router = Router();
    const service = new ReferralService(referralRepo, facilityRepo, patientRepo);
    const controller = new ReferralController(service);
    // Queries
    router.get('/referrals', controller.getReferrals);
    router.get('/referrals/:id', controller.getReferralById);
    // Creation
    router.post('/referrals', controller.createReferral);
    // Facility Lifecycle Actions
    router.post('/referrals/:id/accept', controller.acceptSlot);
    router.post('/referrals/:id/propose-slot', controller.proposeAlternativeSlot);
    router.post('/referrals/:id/cannot-proceed', controller.cannotProceed);
    router.post('/referrals/:id/arrive', controller.recordPatientArrival);
    router.post('/referrals/:id/start-service', controller.startService);
    router.post('/referrals/:id/complete', controller.completeService);
    // Recovery & Rerouting
    router.post('/referrals/:id/reroute', controller.rerouteReferral);
    return router;
};
