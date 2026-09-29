import { Router } from 'express';
import { FacilityController } from '../controllers/facility.controller';
import { FacilityService } from '../services/facility.service';
import { IFacilityRepository } from '../repositories/facility.repository';

export const createFacilityRouter = (facilityRepo: IFacilityRepository): Router => {
  const router = Router();
  const service = new FacilityService(facilityRepo);
  const controller = new FacilityController(service);

  router.get('/facilities', controller.getFacilities);
  router.get('/facilities/match', controller.matchFacilities);
  router.get('/facilities/:id', controller.getFacilityById);
  router.put('/facilities/:id/capacity', controller.updateCapacity);

  return router;
};
