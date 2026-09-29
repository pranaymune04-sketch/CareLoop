export class PatientController {
    patientService;
    constructor(patientService) {
        this.patientService = patientService;
    }
    getPatients = async (_req, res, next) => {
        try {
            const patients = await this.patientService.getAllPatients();
            const response = {
                success: true,
                data: patients,
                meta: {
                    timestamp: new Date().toISOString(),
                    count: patients.length,
                },
            };
            res.status(200).json(response);
        }
        catch (err) {
            next(err);
        }
    };
    getPatientById = async (req, res, next) => {
        try {
            const id = String(req.params.id);
            const patient = await this.patientService.getPatientById(id);
            const response = {
                success: true,
                data: patient,
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
