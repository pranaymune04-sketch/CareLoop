import { BusinessRuleError } from './referral.service.js';
export class FacilityService {
    facilityRepo;
    constructor(facilityRepo) {
        this.facilityRepo = facilityRepo;
    }
    async getAllFacilities() {
        return this.facilityRepo.findAll();
    }
    async getFacilityById(id) {
        const fac = await this.facilityRepo.findById(id);
        if (!fac) {
            throw new BusinessRuleError(`Facility with ID "${id}" not found.`, 404, 'FACILITY_NOT_FOUND');
        }
        return fac;
    }
    async updateCapacity(id, updates) {
        const updated = await this.facilityRepo.updateCapacity(id, updates);
        if (!updated) {
            throw new BusinessRuleError(`Facility with ID "${id}" not found.`, 404, 'FACILITY_NOT_FOUND');
        }
        return updated;
    }
    async matchFacilities(criteria) {
        const facilities = await this.facilityRepo.findAll();
        const results = [];
        for (const fac of facilities) {
            const targetSvc = fac.services.find((s) => s.name.toLowerCase().includes(criteria.department.toLowerCase()));
            // 1. Service Match Factor (30 pts max)
            let serviceMatch = 0;
            if (targetSvc) {
                serviceMatch = targetSvc.specialistAvailable ? 30 : 20;
            }
            // 2. Bed Availability Factor (25 pts max)
            let bedAvailability = 0;
            const bedRatio = fac.totalBeds > 0 ? fac.availableBeds / fac.totalBeds : 0;
            bedAvailability += Math.min(15, Math.round(bedRatio * 15));
            if (criteria.requireIcu || criteria.emergency) {
                bedAvailability += fac.icuBedsAvailable > 0 ? 10 : 0;
            }
            else {
                bedAvailability += 10;
            }
            // 3. Emergency & Readiness Factor (20 pts max)
            let emergencyReadiness = 0;
            if (fac.emergencyAvailable24x7)
                emergencyReadiness += 12;
            if (fac.ambulanceAvailable)
                emergencyReadiness += 8;
            // 4. Distance Factor (15 pts max)
            let distanceSuitability = 0;
            const distance = fac.distanceKm || 20;
            if (distance <= 10)
                distanceSuitability = 15;
            else if (distance <= 25)
                distanceSuitability = 10;
            else if (distance <= 40)
                distanceSuitability = 5;
            else
                distanceSuitability = 2;
            // 5. Queue Factor (10 pts max)
            let queueFactor = 0;
            const queue = targetSvc ? targetSvc.currentQueueLength : 5;
            if (queue <= 3)
                queueFactor = 10;
            else if (queue <= 8)
                queueFactor = 6;
            else
                queueFactor = 2;
            const matchScore = Math.min(100, serviceMatch + bedAvailability + emergencyReadiness + distanceSuitability + queueFactor);
            results.push({
                facilityId: fac.id,
                facilityName: fac.name,
                facilityType: fac.type,
                distanceKm: fac.distanceKm,
                availableBeds: fac.availableBeds,
                icuBedsAvailable: fac.icuBedsAvailable,
                emergencyAvailable24x7: fac.emergencyAvailable24x7,
                ambulanceAvailable: fac.ambulanceAvailable,
                specialistAvailable: targetSvc ? targetSvc.specialistAvailable : false,
                activeDoctorName: targetSvc?.activeDoctorName,
                currentQueueLength: targetSvc ? targetSvc.currentQueueLength : 0,
                estimatedWaitMinutes: targetSvc ? targetSvc.estimatedWaitMinutes : 30,
                matchScore,
                scoringFactors: {
                    serviceMatch,
                    bedAvailability,
                    emergencyReadiness,
                    distanceSuitability,
                    queueFactor,
                },
            });
        }
        // Sort descending by matchScore
        results.sort((a, b) => b.matchScore - a.matchScore);
        return results;
    }
}
