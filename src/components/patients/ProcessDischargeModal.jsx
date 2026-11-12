import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, ShieldCheck, AlertCircle, BedDouble, UserCheck, X } from 'lucide-react';
import { formatReadableDate } from '../../utils/dateUtils';

export default function ProcessDischargeModal({ isOpen, onClose, patientId }) {
  const { patients, processDischarge } = useApp();

  const patient = patients.find((p) => p.id === patientId);

  const [adminName, setAdminName] = useState('Administrator Sarah Connor');
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && patient) {
      setError('');
      setDischargeNotes(
        `Discharge finalized by Administration. Verified doctor clearance (${patient.recommendedByDoctor || 'Physician'}). Bed Room ${patient.roomNumber} vacated and released back to available facility capacity.`
      );
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!patient.dischargeRecommended) {
      setError('Protocol Block: Doctor discharge recommendation is required before administrative discharge can be processed.');
      return;
    }

    const result = processDischarge(patient.id, {
      adminName,
      dischargeNotes,
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
                backgroundColor: '#d1fae5',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <span>Administrative Final Discharge Authorization</span>
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

            {/* Verification Banner */}
            <div
              style={{
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700 }}>
                <CheckCircle2 size={16} />
                Doctor Recommendation Verified
              </div>
              <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '6px' }}>
                Recommended by: <strong>{patient.recommendedByDoctor || 'Physician'}</strong> on {formatReadableDate(patient.recommendedDate)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '4px', fontStyle: 'italic', backgroundColor: 'white', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1fae5' }}>
                "{patient.recommendationNotes}"
              </div>
            </div>

            {/* Patient & Room Release Details */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px',
                marginBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>{patient.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Patient ID: {patient.id} • Admitted: {formatReadableDate(patient.admissionDate)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="status-pill status-active">
                    <BedDouble size={13} />
                    Current Room: {patient.roomNumber}
                  </span>
                  <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                    Will be released upon confirmation
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Name */}
            <div className="form-group">
              <label className="form-label">Processing Administrator <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            {/* Discharge Administrative Notes */}
            <div className="form-group">
              <label className="form-label">Administrative Release Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
              />
              <div className="form-help">
                Finalizing discharge will transition patient status to Discharged, mark as Survivor in performance metrics, and immediately increase available hospital room capacity by 1.
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={!patient.dischargeRecommended}
            >
              <UserCheck size={16} />
              Finalize Discharge & Release Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
