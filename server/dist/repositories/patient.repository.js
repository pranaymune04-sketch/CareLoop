import { seedPatients } from '../data/seedPatients';
export class InMemoryPatientRepository {
    patients = new Map();
    constructor(initialData = seedPatients) {
        for (const pat of initialData) {
            this.patients.set(pat.id, JSON.parse(JSON.stringify(pat)));
        }
    }
    async findById(id) {
        const pat = this.patients.get(id);
        return pat ? JSON.parse(JSON.stringify(pat)) : null;
    }
    async findAll() {
        return JSON.parse(JSON.stringify(Array.from(this.patients.values())));
    }
    async create(patient) {
        const copy = JSON.parse(JSON.stringify(patient));
        this.patients.set(copy.id, copy);
        return JSON.parse(JSON.stringify(copy));
    }
}
