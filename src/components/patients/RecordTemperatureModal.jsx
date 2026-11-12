import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Thermometer, AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { checkIsFever } from '../../utils/calculations';
import { formatReadableDate } from '../../utils/dateUtils';

export default function RecordTemperatureModal({ isOpen, onClose, preselectedPatientId }) {
  const {
    patients,
    recordTemperature,
    currentDate,
    feverThreshold,
  } = useApp();

  const activePatients = patients.filter((p) => p.status === 'Active');

  const [patientId, setPatientId] = useState('');
  const [temperature, setTemperature] = useState('');
  const [date, setDate] = useState(currentDate);
  const [notes, setNotes] = useState('');
  const [recordedBy, setRecordedBy] = useState('Nurse Clara Vance');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPatientId(preselectedPatientId || (activePatients[0]?.id || ''));
      setTemperature('');
      setDate(currentDate);
      setNotes('');
      setError('');
    }
  }, [isOpen, preselectedPatientId, currentDate]);

  if (!isOpen) return null;

  const selectedPatient = patients.find((p) => p.id === patientId);

  // Check if selected patient already has a temperature entry for the selected date
  const isAlreadyRecordedForDate = selectedPatient?.temperatures?.some(
    (t) => t.date.substring(0, 10) === date.substring(0, 10)
  );

  const existingTempEntry = selectedPatient?.temperatures?.find(
    (t) => t.date.substring(0, 10) === date.substring(0, 10)
  );

  const isFever = temperature ? checkIsFever(parseFloat(temperature), feverThreshold) : false;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!patientId) {
      setError('Please select a patient.');
      return;
    }

    if (!temperature || isNaN(parseFloat(temperature))) {
      setError('Please enter a valid numeric temperature reading.');
      return;
    }

    const tempVal = parseFloat(temperature);
    if (tempVal < 32 || tempVal > 44) {
      setError('Body temperature must be within a realistic clinical range (32.0°C - 44.0°C).');
      return;
    }

    const result = recordTemperature(patientId, {
      value: tempVal,
      date,
      notes,
      recordedBy,
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
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Thermometer size={18} />
            </div>
            <span>Record Daily Temperature</span>
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

            {isAlreadyRecordedForDate && (
              <div className="alert-banner alert-warning" style={{ marginBottom: '16px' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Official Entry Already Exists:</strong> {selectedPatient.name} already has an official temperature recorded for {formatReadableDate(date)} ({existingTempEntry?.value}°C).
                  <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                    CareTrack protocol permits only 1 official temperature entry per patient per calendar day.
                  </div>
                </div>
              </div>
            )}

            {/* Patient Selector */}
            <div className="form-group">
              <label className="form-label">
                Select Patient <span className="required">*</span>
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

            {/* Date */}
            <div className="form-group">
              <label className="form-label">
                Record Date <span className="required">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <div className="form-help">
                Daily protocol: only 1 official record per calendar day.
              </div>
            </div>

            {/* Temperature Reading */}
            <div className="form-group">
              <label className="form-label">
                Body Temperature (°C) <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  step="0.1"
                  min="32"
                  max="44"
                  className="form-input"
                  placeholder="e.g. 36.8"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  style={{ fontSize: '1.2rem', fontWeight: 600 }}
                  required
                  autoFocus
                />
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  °C
                </span>
              </div>

              {/* Fever indicator status */}
              {temperature && (
                <div style={{ marginTop: '8px' }}>
                  {isFever ? (
                    <span className="status-pill status-fever" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                      <AlertTriangle size={14} />
                      Fever Detected (≥ {feverThreshold}°C) — Resets 3-Day Recovery Streak
                    </span>
                  ) : (
                    <span className="status-pill status-normal" style={{ fontSize: '0.82rem', padding: '4px 10px' }}>
                      <CheckCircle size={14} />
                      Normal / Afebrile (&lt; {feverThreshold}°C) — Counts Toward Recovery
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Recorded by Nurse */}
            <div className="form-group">
              <label className="form-label">Attending Nurse</label>
              <select
                className="form-select"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
              >
                <option value="Nurse Clara Vance">Nurse Clara Vance (Ward Lead)</option>
                <option value="Nurse James Miller">Nurse James Miller</option>
                <option value="Nurse Priya Patel">Nurse Priya Patel</option>
              </select>
            </div>

            {/* Clinical observations / notes */}
            <div className="form-group">
              <label className="form-label">Clinical Notes / Symptoms</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Optional notes: chills, cough, headache, patient resting..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isAlreadyRecordedForDate}
            >
              Save Temperature
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
