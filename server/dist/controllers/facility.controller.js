export class FacilityController {
    facilityService;
    constructor(facilityService) {
        this.facilityService = facilityService;
    }
    getFacilities = async (_req, res, next) => {
        try {
            const facilities = await this.facilityService.getAllFacilities();
            const response = {
                success: true,
                data: facilities,
                meta: {
                    timestamp: new Date().toISOString(),
                    count: facilities.length,
                },
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    };
    getFacilityById = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const facility = await this.facilityService.getFacilityById(id);
            const response = {
                success: true,
                data: facility,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    };
    matchFacilities = async (req, res, next) => {
        try {
            const { department, emergency, maxDistanceKm, requireIcu } = req.query;
            const criteria = {
                department: department || 'General Medicine & OPD',
                emergency: emergency === 'true' || emergency === '1',
                maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
                requireIcu: requireIcu === 'true' || requireIcu === '1',
            };
            const matched = await this.facilityService.matchFacilities(criteria);
            const response = {
                success: true,
                data: matched,
                meta: {
                    timestamp: new Date().toISOString(),
                    count: matched.length,
                },
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    };
    updateCapacity = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.facilityService.updateCapacity(id, req.body);
            const response = {
                success: true,
                data: updated,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    };
}
