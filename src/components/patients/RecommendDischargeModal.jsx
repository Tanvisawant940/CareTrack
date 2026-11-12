import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FileCheck2, CheckCircle2, AlertTriangle, AlertCircle, Calendar, X } from 'lucide-react';
import { calculateRecoveryProgress } from '../../utils/calculations';
import { formatReadableDate } from '../../utils/dateUtils';

export default function RecommendDischargeModal({ isOpen, onClose, patientId }) {
  const { patients, recommendDischarge, feverThreshold } = useApp();

  const patient = patients.find((p) => p.id === patientId);

  const [doctorName, setDoctorName] = useState('Dr. Marcus Wells');
  const [recommendationNotes, setRecommendationNotes] = useState('');
  const [error, setError] = useState('');

  const recovery = patient 
    ? calculateRecoveryProgress(patient.temperatures || [], feverThreshold)
    : { consecutiveDays: 0, isEligible: false, lastStreakDates: [] };

  useEffect(() => {
    if (isOpen && patient) {
      setError('');
      setRecommendationNotes(
        `Clinical criteria verified: ${patient.name} has maintained ${recovery.consecutiveDays} consecutive fever-free days (threshold < ${feverThreshold}°C). Vitals are stable, lungs clear, patient is asymptomatic. Recommended for discharge from quarantine facility.`
      );
    }
  }, [isOpen, patient, feverThreshold]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (recovery.consecutiveDays < 3) {
      setError('Eligibility Requirement Not Met: Patient must have 3 complete consecutive fever-free days.');
      return;
    }

    const result = recommendDischarge(patient.id, {
      doctorName,
      recommendationNotes,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileCheck2 size={18} />
            </div>
            <span>Physician Discharge Recommendation</span>
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

            {/* Patient Header */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {patient.name}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    ID: <strong>{patient.id}</strong> • Room: <strong>{patient.roomNumber}</strong> • Age: {patient.age}y
                  </div>
                </div>

                <span className="status-pill status-done" style={{ padding: '6px 12px' }}>
                  <CheckCircle2 size={14} />
                  {recovery.consecutiveDays}/3 Fever-Free Days
                </span>
              </div>

              {/* Verified Days Streak Table */}
              <div style={{ marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '6px' }}>
                  Verified 3-Day Fever-Free Streak (Threshold &lt; {feverThreshold}°C):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {recovery.lastStreakDates.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        padding: '6px 8px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600 }}>
                        Day {idx + 1}: {formatReadableDate(item.date)}
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#047857' }}>
                        {item.temp}°C
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommending Physician */}
            <div className="form-group">
              <label className="form-label">Recommending Physician <span className="required">*</span></label>
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

            {/* Recommendation Notes */}
            <div className="form-group">
              <label className="form-label">
                Physician Discharge Justification & Clinical Summary <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                rows="4"
                value={recommendationNotes}
                onChange={(e) => setRecommendationNotes(e.target.value)}
                required
              />
              <div className="form-help">
                This clinical recommendation will be submitted to the Facility Administrator for final discharge processing and room release.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={recovery.consecutiveDays < 3}
            >
              Confirm Discharge Recommendation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
