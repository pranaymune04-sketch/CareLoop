import { Patient } from '../types/index.js';
import { IPatientRepository } from '../repositories/patient.repository.js';
import { BusinessRuleError } from './referral.service.js';

export class PatientService {
  constructor(private patientRepo: IPatientRepository) {}

  async getAllPatients(): Promise<Patient[]> {
    return this.patientRepo.findAll();
  }

  async getPatientById(id: string): Promise<Patient> {
    const pat = await this.patientRepo.findById(id);
    if (!pat) {
      throw new BusinessRuleError(`Patient with ID "${id}" not found.`, 404, 'PATIENT_NOT_FOUND');
    }
    return pat;
  }
}
