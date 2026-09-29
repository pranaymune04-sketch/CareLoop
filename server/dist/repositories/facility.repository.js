import { seedFacilities } from '../data/seedFacilities';
export class InMemoryFacilityRepository {
    facilities = new Map();
    constructor(initialData = seedFacilities) {
        for (const fac of initialData) {
            this.facilities.set(fac.id, JSON.parse(JSON.stringify(fac)));
        }
    }
    async findById(id) {
        const fac = this.facilities.get(id);
        return fac ? JSON.parse(JSON.stringify(fac)) : null;
    }
    async findAll() {
        return JSON.parse(JSON.stringify(Array.from(this.facilities.values())));
    }
    async updateCapacity(id, updates) {
        const existing = this.facilities.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
        };
        this.facilities.set(id, updated);
        return JSON.parse(JSON.stringify(updated));
    }
}
