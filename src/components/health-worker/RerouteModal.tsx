import React, { useState } from 'react';
import { Modal, Button, FormField } from '@/components/ui';
import { Referral } from '@/types';
import { CareLoopStore } from '@/mock';
import { Compass, Building2, AlertTriangle } from 'lucide-react';

interface RerouteModalProps {
  referral: Referral | null;
  isOpen: boolean;
  onClose: () => void;
  onRerouteComplete: (updatedReferral: Referral) => void;
}

export const RerouteModal: React.FC<RerouteModalProps> = ({
  referral,
  isOpen,
  onClose,
  onRerouteComplete,
}) => {
  const allFacilities = CareLoopStore.getFacilities();
  
  // Exclude current facility from candidates
  const candidateFacilities = allFacilities.filter(
    (f) => f.id !== referral?.targetFacilityId
  );

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    candidateFacilities[0]?.id || ''
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [reason, setReason] = useState<string>(
    'Patient missed window / Facility capacity delay. Rerouting to nearest available facility.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When target facility changes, default to first department
  const selectedFacility = allFacilities.find((f) => f.id === selectedFacilityId) || candidateFacilities[0];

  React.useEffect(() => {
    if (selectedFacility && selectedFacility.services.length > 0) {
      setSelectedDepartment(selectedFacility.services[0].name);
    }
  }, [selectedFacilityId]);

  if (!referral) return null;

  const handleConfirmReroute = () => {
    if (!selectedFacility) return;
    setIsSubmitting(true);

    const updated = CareLoopStore.rerouteReferral(
      referral.id,
      selectedFacility,
      selectedDepartment || selectedFacility.services[0]?.name || 'General OPD',
      reason
    );

    setIsSubmitting(false);
    if (updated) {
      onRerouteComplete(updated);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Pre-Service Reroute"
      description={`Care Recovery Radar: Reroute Referral ${referral.referralNumber} (${referral.patientName})`}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="emergency"
            size="sm"
            leftIcon={<Compass className="w-3.5 h-3.5" />}
            onClick={handleConfirmReroute}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Rerouting...' : 'Confirm Pre-Service Reroute'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Exception Context Banner */}
        <div className="p-3 bg-red-50 border-l-4 border-l-red-600 rounded border border-red-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-950 uppercase text-[11px]">
                Current Facility Exception / Bottleneck
              </div>
              <p className="text-red-900 mt-0.5">
                Current: <strong>{referral.targetFacilityName}</strong> ({referral.targetDepartment})
              </p>
              {referral.gapReason && (
                <p className="text-red-700 text-[11px] mt-0.5">
                  Trigger Reason: {referral.gapReason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <FormField label="Operational Reason for Rerouting" required>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
          >
            <option value="Patient missed window / Facility capacity delay. Rerouting to nearest available facility.">
              Patient missed window / Delay in receiving facility queue
            </option>
            <option value="Specialist or bed unavailable at primary chosen hospital.">
              Specialist or bed unavailable at primary chosen hospital
            </option>
            <option value="Patient logistics / transport unable to reach original facility distance.">
              Patient logistics / transport unable to reach original facility distance
            </option>
            <option value="Hospital proposed unviable alternative slot; patient requested earlier slot elsewhere.">
              Hospital proposed unviable alternative slot; requesting slot at nearby facility
            </option>
          </select>
        </FormField>

        <FormField label="Select Alternative Receiving Facility" required helperText="Filtered by regional network and service availability">
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
          >
            {candidateFacilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.name} ({fac.type}) — ~{fac.distanceKm} km | {fac.availableBeds} beds available
              </option>
            ))}
          </select>
        </FormField>

        {selectedFacility && (
          <FormField label="Target Department at New Facility" required>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gov-border rounded-gov bg-white focus:outline-none focus:ring-1 focus:ring-gov-green-700"
            >
              {selectedFacility.services.map((srv) => (
                <option key={srv.id} value={srv.name}>
                  {srv.name} (Wait: ~{srv.estimatedWaitMinutes}m, Specialist: {srv.specialistAvailable ? 'Yes' : 'No'})
                </option>
              ))}
            </select>
          </FormField>
        )}

        {/* Selected Facility Capabilities Breakdown */}
        {selectedFacility && (
          <div className="p-3 bg-slate-50 border border-gov-border rounded space-y-1.5 text-[11px] text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-gov-green-950">
              <Building2 className="w-3.5 h-3.5 text-gov-green-800" />
              <span>{selectedFacility.name} Capabilities</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>Type: <strong>{selectedFacility.type}</strong></div>
              <div>Distance: <strong>~{selectedFacility.distanceKm} km</strong></div>
              <div>Available Beds: <strong>{selectedFacility.availableBeds} / {selectedFacility.totalBeds}</strong></div>
              <div>24x7 Emergency: <strong>{selectedFacility.emergencyAvailable24x7 ? 'Yes' : 'No'}</strong></div>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              * Note: Rerouting resets status to Requested Slot (Awaiting confirmation from new facility).
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
