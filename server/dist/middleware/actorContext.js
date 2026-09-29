export const actorContextMiddleware = (req, _res, next) => {
    const role = req.headers['x-actor-role'];
    const actorId = req.headers['x-actor-id'];
    const actorName = req.headers['x-actor-name'];
    const facilityId = req.headers['x-facility-id'];
    req.actor = {
        role: role || req.body?.actorRole || undefined,
        actorId: actorId || req.body?.actorId || undefined,
        actorName: actorName || req.body?.actorName || undefined,
        facilityId: facilityId || req.body?.facilityId || undefined,
    };
    next();
};
