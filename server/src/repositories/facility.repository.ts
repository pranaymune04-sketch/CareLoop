import { Facility } from '../types/index';
import { seedFacilities } from '../data/seedFacilities';

export interface IFacilityRepository {
  findById(id: string): Promise<Facility | null>;
  findAll(): Promise<Facility[]>;
  updateCapacity(id: string, updates: Partial<Facility>): Promise<Facility | null>;
}

export class InMemoryFacilityRepository implements IFacilityRepository {
  private facilities: Map<string, Facility> = new Map();

  constructor(initialData: Facility[] = seedFacilities) {
    for (const fac of initialData) {
      this.facilities.set(fac.id, JSON.parse(JSON.stringify(fac)));
    }
  }

  async findById(id: string): Promise<Facility | null> {
    const fac = this.facilities.get(id);
    return fac ? JSON.parse(JSON.stringify(fac)) : null;
  }

  async findAll(): Promise<Facility[]> {
    return JSON.parse(JSON.stringify(Array.from(this.facilities.values())));
  }

  async updateCapacity(id: string, updates: Partial<Facility>): Promise<Facility | null> {
    const existing = this.facilities.get(id);
    if (!existing) return null;

    const updated: Facility = {
      ...existing,
      ...updates,
    };

    this.facilities.set(id, updated);
    return JSON.parse(JSON.stringify(updated));
  }
}
