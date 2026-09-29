import { Patient } from '../types/index';
import { IPatientRepository } from '../repositories/patient.repository';
import { BusinessRuleError } from './referral.service';

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
