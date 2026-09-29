import { BusinessRuleError } from './referral.service.js';
export class PatientService {
    patientRepo;
    constructor(patientRepo) {
        this.patientRepo = patientRepo;
    }
    async getAllPatients() {
        return this.patientRepo.findAll();
    }
    async getPatientById(id) {
        const pat = await this.patientRepo.findById(id);
        if (!pat) {
            throw new BusinessRuleError(`Patient with ID "${id}" not found.`, 404, 'PATIENT_NOT_FOUND');
        }
        return pat;
    }
}
