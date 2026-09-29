export class ReferralController {
    referralService;
    constructor(referralService) {
        this.referralService = referralService;
    }
    getReferrals = async (req, res, next) => {
        try {
            const { status, priority, referralType, targetFacilityId, referringWorkerId, patientId, atRisk } = req.query;
            const filter = {
                status: status,
                priority: priority,
                referralType: referralType,
                targetFacilityId: targetFacilityId,
                referringWorkerId: referringWorkerId,
                patientId: patientId,
                atRiskOnly: atRisk === 'true' || atRisk === '1',
            };
            const referrals = await this.referralService.getAllReferrals(filter);
            const response = {
                success: true,
                data: referrals,
                meta: {
                    timestamp: new Date().toISOString(),
                    count: referrals.length,
                },
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    };
    getReferralById = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const referral = await this.referralService.getReferralById(id);
            const response = {
                success: true,
                data: referral,
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
    createReferral = async (req, res, next) => {
        try {
            const newReferral = await this.referralService.createReferral(req.body, req.actor);
            const response = {
                success: true,
                data: newReferral,
                meta: {
                    timestamp: new Date().toISOString(),
                },
            };
            res.status(201).json(response);
        }
        catch (err) {
            next(err);
        }
    };
    acceptSlot = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.referralService.acceptSlot(id, req.body, req.actor);
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
    proposeAlternativeSlot = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.referralService.proposeAlternativeSlot(id, req.body, req.actor);
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
    cannotProceed = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.referralService.cannotProceed(id, req.body, req.actor);
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
    recordPatientArrival = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.referralService.recordPatientArrival(id, req.body, req.actor);
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
    startService = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.referralService.startService(id, req.body, req.actor);
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
    completeService = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.referralService.completeService(id, req.body, req.actor);
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
    rerouteReferral = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const updated = await this.referralService.rerouteReferral(id, req.body, req.actor);
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
