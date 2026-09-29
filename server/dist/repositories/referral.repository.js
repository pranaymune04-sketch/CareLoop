import { seedReferrals } from '../data/seedReferrals.js';
export class InMemoryReferralRepository {
    referrals = new Map();
    constructor(initialData = seedReferrals) {
        for (const ref of initialData) {
            this.referrals.set(ref.id, JSON.parse(JSON.stringify(ref)));
        }
    }
    async findById(id) {
        const ref = this.referrals.get(id);
        return ref ? JSON.parse(JSON.stringify(ref)) : null;
    }
    async findByReferralNumber(referralNumber) {
        for (const ref of this.referrals.values()) {
            if (ref.referralNumber === referralNumber) {
                return JSON.parse(JSON.stringify(ref));
            }
        }
        return null;
    }
    async findAll(filter) {
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
                result = result.filter((r) => r.hasGapAlert ||
                    r.status === 'GAP_DETECTED' ||
                    r.status === 'CANCELLED' ||
                    r.slot.status === 'ALTERNATIVE_PROPOSED');
            }
        }
        // Sort descending by createdAt
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return JSON.parse(JSON.stringify(result));
    }
    async create(referral) {
        const copy = JSON.parse(JSON.stringify(referral));
        this.referrals.set(copy.id, copy);
        return JSON.parse(JSON.stringify(copy));
    }
    async update(id, updates) {
        const existing = this.referrals.get(id);
        if (!existing)
            return null;
        const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        this.referrals.set(id, updated);
        return JSON.parse(JSON.stringify(updated));
    }
    async appendEvent(id, event) {
        const existing = this.referrals.get(id);
        if (!existing)
            return null;
        existing.events.push(event);
        existing.updatedAt = new Date().toISOString();
        this.referrals.set(id, existing);
        return JSON.parse(JSON.stringify(existing));
    }
}
