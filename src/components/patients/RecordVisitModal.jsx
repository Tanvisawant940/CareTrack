import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Stethoscope, AlertCircle, AlertTriangle, CheckCircle2, Thermometer, X } from 'lucide-react';
import { calculateRecoveryProgress } from '../../utils/calculations';
import { formatReadableDate } from '../../utils/dateUtils';

export default function RecordVisitModal({ isOpen, onClose, preselectedPatientId, onOpenRecommendDischarge }) {
  const {
    patients,
    recordDoctorVisit,
    currentDate,
    feverThreshold,
  } = useApp();

  const activePatients = patients.filter((p) => p.status === 'Active');

  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(currentDate);
  const [doctorName, setDoctorName] = useState('Dr. Marcus Wells');
  const [observations, setObservations] = useState('');
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPatientId(preselectedPatientId || (activePatients[0]?.id || ''));
      setDate(currentDate);
      setObservations('');
      setTreatmentNotes('');
      setError('');
    }
  }, [isOpen, preselectedPatientId, currentDate]);

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === patientId);

  // Check today's temperature entry
  const tempEntryForDate = selectedPatient?.temperatures?.find(
    (t) => t.date.substring(0, 10) === date.substring(0, 10)
  );

  // Check today's existing visit
  const existingVisit = selectedPatient?.doctorVisits?.find(
    (v) => v.date.substring(0, 10) === date.substring(0, 10)
  );

  const recovery = selectedPatient 
    ? calculateRecoveryProgress(selectedPatient.temperatures || [], feverThreshold)
    : { consecutiveDays: 0, isEligible: false };

  const isTempMissing = !tempEntryForDate;
  const isAlreadyVisited = !!existingVisit;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    if (isTempMissing) {
      setError('Protocol Block: Temperature must be recorded by a nurse before conducting a doctor visit.');
      return;
    }

    if (isAlreadyVisited) {
      setError('Duplicate Visit Block: A doctor visit has already been conducted for this patient today.');
      return;
    }

    if (!observations.trim()) {
      setError('Please enter medical observations.');
      return;
    }

    const result = recordDoctorVisit(patientId, {
      date,
      doctorName,
      observations,
      treatmentNotes,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stethoscope size={18} />
            </div>
            <span>Daily Physician Round & Clinical Notes</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-banner alert-danger" style={{ marginBottom: '16px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{error}</div>
              </div>
            )}

            {/* Rule 3 Enforcement: Temp must precede visit */}
            {isTempMissing && selectedPatient && (
              <div className="alert-banner alert-danger" style={{ marginBottom: '16px' }}>
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Doctor Visit Blocked:</strong> Daily temperature has not yet been recorded for {formatReadableDate(date)}.
                  <div style={{ marginTop: '4px', fontSize: '0.82rem' }}>
                    Facility clinical protocol mandates that the patient temperature must be recorded by nursing staff before the daily physician visit can occur.
                  </div>
                </div>
              </div>
            )}

            {/* Rule 4 Enforcement: Duplicate visit prevention */}
            {isAlreadyVisited && selectedPatient && (
              <div className="alert-banner alert-warning" style={{ marginBottom: '16px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Daily Visit Already Completed:</strong> A doctor visit was already recorded today by {existingVisit.doctorName}.
                  <div style={{ marginTop: '4px', fontSize: '0.82rem' }}>
                    CareTrack protocol allows 1 official physician visit per patient per calendar day.
                  </div>
                </div>
              </div>
            )}

            {/* Patient Selector */}
            <div className="form-group">
              <label className="form-label">
                Patient <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                disabled={!!preselectedPatientId}
                required
              >
                {activePatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ID: {p.id} | Room {p.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Clinical Context Banner */}
            {selectedPatient && tempEntryForDate && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Thermometer size={18} style={{ color: tempEntryForDate.isFever ? '#dc2626' : '#059669' }} />
                  <div>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>Today's Recorded Vitals: </span>
                    <strong style={{ fontSize: '0.98rem', color: tempEntryForDate.isFever ? '#dc2626' : '#059669' }}>
                      {tempEntryForDate.value}°C
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({tempEntryForDate.isFever ? 'Fever Spike' : 'Afebrile'}) — by {tempEntryForDate.recordedBy}
                    </span>
                  </div>
                </div>

                {/* Recovery Progress Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Consecutive Fever-Free:</span>
                  <span
                    className="status-pill"
                    style={{
                      backgroundColor: recovery.isEligible ? '#ecfdf5' : '#f1f5f9',
                      color: recovery.isEligible ? '#065f46' : '#334155',
                      fontWeight: 700,
                    }}
                  >
                    {recovery.consecutiveDays} / 3 Days
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Doctor Name */}
              <div className="form-group">
                <label className="form-label">Attending Physician <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                >
                  <option value="Dr. Marcus Wells">Dr. Marcus Wells (Chief of Quarantine)</option>
                  <option value="Dr. Evelyn Reed">Dr. Evelyn Reed (Infectious Disease Specialist)</option>
                  <option value="Dr. Noah Bennett">Dr. Noah Bennett (Attending Internist)</option>
                </select>
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Visit Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Medical Observations */}
            <div className="form-group">
              <label className="form-label">
                Medical Observations & Assessment <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Document respiratory status, bilateral lung auscultation, alert level, heart sounds, symptoms..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                required
              />
            </div>

            {/* Treatment Notes */}
            <div className="form-group">
              <label className="form-label">Treatment Notes & Prescription</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Prescribed medications, hydration protocols, oxygen therapy, or dietary guidelines..."
                value={treatmentNotes}
                onChange={(e) => setTreatmentNotes(e.target.value)}
              />
            </div>

            {/* Discharge Recommendation Callout if criteria met */}
            {recovery.isEligible && !selectedPatient?.dischargeRecommended && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.88rem' }}>
                    🌟 Discharge Recovery Criteria Met! (3/3 Days)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '2px' }}>
                    Patient has maintained 3 consecutive fever-free days. You can recommend discharge for admin processing.
                  </div>
                </div>
                {onOpenRecommendDischarge && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      onClose();
                      onOpenRecommendDischarge(patientId);
                    }}
                  >
                    Recommend Discharge
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isTempMissing || isAlreadyVisited}
            >
              Complete Daily Visit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
