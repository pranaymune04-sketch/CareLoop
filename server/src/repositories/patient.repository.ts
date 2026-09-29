import { Patient } from '../types/index.js';
import { seedPatients } from '../data/seedPatients.js';

export interface IPatientRepository {
  findById(id: string): Promise<Patient | null>;
  findAll(): Promise<Patient[]>;
  create(patient: Patient): Promise<Patient>;
}

export class InMemoryPatientRepository implements IPatientRepository {
  private patients: Map<string, Patient> = new Map();

  constructor(initialData: Patient[] = seedPatients) {
    for (const pat of initialData) {
      this.patients.set(pat.id, JSON.parse(JSON.stringify(pat)));
    }
  }

  async findById(id: string): Promise<Patient | null> {
    const pat = this.patients.get(id);
    return pat ? JSON.parse(JSON.stringify(pat)) : null;
  }

  async findAll(): Promise<Patient[]> {
    return JSON.parse(JSON.stringify(Array.from(this.patients.values())));
  }

  async create(patient: Patient): Promise<Patient> {
    const copy = JSON.parse(JSON.stringify(patient));
    this.patients.set(copy.id, copy);
    return JSON.parse(JSON.stringify(copy));
  }
}
