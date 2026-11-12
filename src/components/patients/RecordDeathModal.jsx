import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertOctagon, AlertCircle, BedDouble, X } from 'lucide-react';

export default function RecordDeathModal({ isOpen, onClose, patientId }) {
  const { patients, recordPatientDeath, currentDate } = useApp();

  const patient = patients.find((p) => p.id === patientId);

  const [dateOfDeath, setDateOfDeath] = useState(currentDate);
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [deathNotes, setDeathNotes] = useState('');
  const [adminName, setAdminName] = useState('Administrator Sarah Connor');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && patient) {
      setError('');
      setDateOfDeath(currentDate);
      setCauseOfDeath('Severe cardiorespiratory failure secondary to acute quarantine illness.');
      setDeathNotes(`Clinical demise declared by attending physician. Administrative verification completed.`);
    }
  }, [isOpen, patient, currentDate]);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!causeOfDeath.trim()) {
      setError('Please provide the clinical cause of death.');
      return;
    }

    const result = recordPatientDeath(patient.id, {
      dateOfDeath,
      causeOfDeath,
      deathNotes,
      adminName,
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
          <div className="modal-title" style={{ color: '#991b1b' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertOctagon size={18} />
            </div>
            <span>Record Official Clinical Demise</span>
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

            <div className="alert-banner alert-danger" style={{ marginBottom: '16px' }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Permanent Record Action:</strong> Recording a patient death will update facility mortality metrics and release Bed Room <strong>{patient.roomNumber}</strong>. Historical charts and visits will remain archived.
              </div>
            </div>

            {/* Patient Info */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{patient.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ID: {patient.id} • Room: {patient.roomNumber} • Age: {patient.age}y • Primary Diagnosis: {patient.diagnosis}
              </div>
            </div>

            {/* Date of Death */}
            <div className="form-group">
              <label className="form-label">Date of Demise <span className="required">*</span></label>
              <input
                type="date"
                className="form-input"
                value={dateOfDeath}
                onChange={(e) => setDateOfDeath(e.target.value)}
                required
              />
            </div>

            {/* Cause of Death */}
            <div className="form-group">
              <label className="form-label">Official Cause of Death <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                value={causeOfDeath}
                onChange={(e) => setCauseOfDeath(e.target.value)}
                required
              />
            </div>

            {/* Recording Admin */}
            <div className="form-group">
              <label className="form-label">Verifying Administrator</label>
              <input
                type="text"
                className="form-input"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            {/* Death Notes */}
            <div className="form-group">
              <label className="form-label">Clinical Demise Summary / Resuscitation Notes</label>
              <textarea
                className="form-textarea"
                rows="3"
                value={deathNotes}
                onChange={(e) => setDeathNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm & Record Demise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
