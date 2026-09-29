import { Referral, ReferralEvent, ReferralStatus, ReferralPriority, ReferralType } from '../types/index';
import { seedReferrals } from '../data/seedReferrals';

export interface ReferralFilter {
  status?: ReferralStatus;
  priority?: ReferralPriority;
  referralType?: ReferralType;
  targetFacilityId?: string;
  referringWorkerId?: string;
  patientId?: string;
  atRiskOnly?: boolean;
}

export interface IReferralRepository {
  findById(id: string): Promise<Referral | null>;
  findByReferralNumber(referralNumber: string): Promise<Referral | null>;
  findAll(filter?: ReferralFilter): Promise<Referral[]>;
  create(referral: Referral): Promise<Referral>;
  update(id: string, updates: Partial<Referral>): Promise<Referral | null>;
  appendEvent(id: string, event: ReferralEvent): Promise<Referral | null>;
}

export class InMemoryReferralRepository implements IReferralRepository {
  private referrals: Map<string, Referral> = new Map();

  constructor(initialData: Referral[] = seedReferrals) {
    for (const ref of initialData) {
      this.referrals.set(ref.id, JSON.parse(JSON.stringify(ref)));
    }
  }

  async findById(id: string): Promise<Referral | null> {
    const ref = this.referrals.get(id);
    return ref ? JSON.parse(JSON.stringify(ref)) : null;
  }

  async findByReferralNumber(referralNumber: string): Promise<Referral | null> {
    for (const ref of this.referrals.values()) {
      if (ref.referralNumber === referralNumber) {
        return JSON.parse(JSON.stringify(ref));
      }
    }
    return null;
  }

  async findAll(filter?: ReferralFilter): Promise<Referral[]> {
    let result = Array.from(this.referrals.values());

    if (filter) {
      if (filter.status) {
        result = result.filter((r) => r.status === filter.status);
      }
      if (filter.priority) {
        result = result.filter((r) => r.priority === filter.priority);
      }
      if (filter.referralType) {
        result = result.filter((r) => r.referralType === filter.referralType);
      }
      if (filter.targetFacilityId) {
        result = result.filter((r) => r.targetFacilityId === filter.targetFacilityId);
      }
      if (filter.referringWorkerId) {
        result = result.filter((r) => r.referringWorkerId === filter.referringWorkerId);
      }
      if (filter.patientId) {
        result = result.filter((r) => r.patientId === filter.patientId);
      }
      if (filter.atRiskOnly) {
        result = result.filter(
          (r) =>
            r.hasGapAlert ||
            r.status === 'GAP_DETECTED' ||
            r.status === 'CANCELLED' ||
            r.slot.status === 'ALTERNATIVE_PROPOSED'
        );
      }
    }

    // Sort descending by createdAt
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return JSON.parse(JSON.stringify(result));
  }

  async create(referral: Referral): Promise<Referral> {
    const copy = JSON.parse(JSON.stringify(referral));
    this.referrals.set(copy.id, copy);
    return JSON.parse(JSON.stringify(copy));
  }

  async update(id: string, updates: Partial<Referral>): Promise<Referral | null> {
    const existing = this.referrals.get(id);
    if (!existing) return null;

    const updated: Referral = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.referrals.set(id, updated);
    return JSON.parse(JSON.stringify(updated));
  }

  async appendEvent(id: string, event: ReferralEvent): Promise<Referral | null> {
    const existing = this.referrals.get(id);
    if (!existing) return null;

    existing.events.push(event);
    existing.updatedAt = new Date().toISOString();

    this.referrals.set(id, existing);
    return JSON.parse(JSON.stringify(existing));
  }
}
