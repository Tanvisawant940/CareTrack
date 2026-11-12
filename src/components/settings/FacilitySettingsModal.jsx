import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sliders,
  Thermometer,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  FastForward,
  X,
} from 'lucide-react';
import { formatReadableDate } from '../../utils/dateUtils';

export default function FacilitySettingsModal({ isOpen, onClose }) {
  const {
    feverThreshold,
    setFeverThreshold,
    resetDemoData,
    simulatedOffset,
    advanceDay,
    resetSimulationDate,
    currentDate,
  } = useApp();

  const [thresholdInput, setThresholdInput] = useState(feverThreshold.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveThreshold = (e) => {
    e.preventDefault();
    const val = parseFloat(thresholdInput);
    if (!isNaN(val) && val >= 36.0 && val <= 40.0) {
      setFeverThreshold(val);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handlePresetSelect = (preset) => {
    setThresholdInput(preset.toString());
    setFeverThreshold(preset);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
                color: 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sliders size={18} />
            </div>
            <span>Facility Clinical Settings & Simulation</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Configurable Fever Threshold Section */}
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              backgroundColor: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Thermometer size={18} style={{ color: '#d97706' }} />
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Configurable Fever Threshold
              </h4>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              <Info size={13} style={{ display: 'inline', marginRight: '4px' }} />
              <strong>Facility Medical Rule:</strong> To adapt to changing isolation guidelines and local infection control policies, the pyrexia cutoff is dynamically configurable. Readings equal to or above this value reset patient 3-day recovery streaks.
            </div>

            <form onSubmit={handleSaveThreshold}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="36.0"
                  max="40.0"
                  className="form-input"
                  style={{ width: '130px', fontWeight: 700, fontSize: '1.1rem' }}
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  required
                />
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>°C</span>
                <button type="submit" className="btn btn-primary btn-sm">
                  Apply Threshold
                </button>
                {savedSuccess && (
                  <span style={{ fontSize: '0.8rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> Updated!
                  </span>
                )}
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Presets:</span>
                {[37.2, 37.5, 37.8, 38.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      borderRadius: '4px',
                      border: feverThreshold === preset ? '1px solid var(--primary-600)' : '1px solid var(--border-color)',
                      backgroundColor: feverThreshold === preset ? 'var(--primary-50)' : '#f8fafc',
                      color: feverThreshold === preset ? 'var(--primary-800)' : 'var(--text-main)',
                      fontWeight: feverThreshold === preset ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {preset}°C {preset === 37.5 && '(Default)'}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Evaluator Simulation Date Controller */}
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              backgroundColor: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calendar size={18} style={{ color: '#2563eb' }} />
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Multi-Day Workflow Simulator
              </h4>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Advance the facility operational calendar to test multi-day rounds, subsequent daily temperatures, doctor visits, and 3-consecutive-day discharge qualification.
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 12px', background: 'white', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem', fontWeight: 600 }}>
                Active Date: <strong>{formatReadableDate(currentDate)}</strong> {simulatedOffset !== 0 && `(+${simulatedOffset}d)`}
              </div>

              <button
                type="button"
                onClick={() => advanceDay(1)}
                className="btn btn-secondary btn-sm"
              >
                <FastForward size={14} />
                Advance +1 Day
              </button>

              {simulatedOffset !== 0 && (
                <button
                  type="button"
                  onClick={resetSimulationDate}
                  className="btn btn-secondary btn-sm"
                >
                  <RotateCcw size={14} />
                  Reset to Real Today
                </button>
              )}
            </div>
          </div>

          {/* Reset Demo Data */}
          <div
            style={{
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              backgroundColor: '#fef2f2',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <RotateCcw size={18} style={{ color: '#dc2626' }} />
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#991b1b' }}>
                Reset Demonstration Dataset
              </h4>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginBottom: '12px' }}>
              Restores initial 10 demo patient records across pending temperatures, awaiting doctor visits, fever resets, and 3-day recovery eligibility.
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all demo data back to initial baseline? Any newly admitted patients will be reset.')) {
                  resetDemoData();
                  onClose();
                }
              }}
              className="btn btn-danger btn-sm"
            >
              Reset All Demo Data
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
