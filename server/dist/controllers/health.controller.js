export class HealthController {
    getHealth = (_req, res) => {
        const response = {
            success: true,
            data: {
                service: 'CareLoop Backend Coordination Engine',
                status: 'ok',
                uptimeSeconds: Math.floor(process.uptime()),
                mode: 'in-memory-repository',
            },
            meta: {
                timestamp: new Date().toISOString(),
            },
        };
        res.status(200).json(response);
    };
}
