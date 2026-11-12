import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  BedDouble,
  Calendar,
  Thermometer,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import { calculateRecoveryProgress, getPatientDailyStatus } from '../../utils/calculations';
import { formatReadableDate } from '../../utils/dateUtils';

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patientId,
  onRecordTemp,
  onRecordVisit,
  onRecommendDischarge,
  onProcessDischarge,
  onRecordDeath,
}) {
  const { patients, currentDate, feverThreshold, currentRole } = useApp();

  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals', 'visits', 'overview'

  const patient = patients.find((p) => p.id === patientId);

  if (!isOpen || !patient) return null;

  const recovery = calculateRecoveryProgress(patient.temperatures || [], feverThreshold);
  const dailyStatus = getPatientDailyStatus(patient, currentDate, feverThreshold);

  const getStatusBadge = () => {
    switch (patient.status) {
      case 'Discharged':
        return <span className="status-pill status-discharged">Discharged (Survivor)</span>;
      case 'Deceased':
        return <span className="status-pill status-deceased">Deceased</span>;
      default:
        if (patient.dischargeRecommended) {
          return <span className="status-pill status-recommended">Discharge Recommended</span>;
        }
        if (dailyStatus.hasTempToday && dailyStatus.hasVisitToday) {
          return <span className="status-pill status-done">All Rounds Done Today</span>;
        }
        if (dailyStatus.hasTempToday && !dailyStatus.hasVisitToday) {
          return <span className="status-pill status-pending">Awaiting Doctor Visit</span>;
        }
        return <span className="status-pill status-pending">Temp Pending Today</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {patient.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {patient.name}
                </h3>
                {getStatusBadge()}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Patient ID: <strong>{patient.id}</strong> • Bed Room: <strong>{patient.roomNumber || `Released (${patient.previousRoom})`}</strong> • Age: {patient.age}y ({patient.gender})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* Recovery Progress Bar Card */}
          <div
            style={{
              backgroundColor: recovery.isEligible ? '#ecfdf5' : '#f8fafc',
              border: `1px solid ${recovery.isEligible ? '#a7f3d0' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Recovery Protocol: 3 Consecutive Fever-Free Days
                </span>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Threshold: &lt; {feverThreshold}°C • A fever resets count • Missing days break continuity
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: recovery.isEligible ? '#065f46' : 'var(--text-main)' }}>
                  {recovery.consecutiveDays} / 3 Days
                </span>
                {recovery.isEligible && (
                  <span className="status-pill status-done" style={{ fontSize: '0.74rem' }}>
                    <CheckCircle2 size={13} />
                    Eligible for Review
                  </span>
                )}
              </div>
            </div>

            {/* Meter Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
              {[1, 2, 3].map((step) => {
                const isFilled = recovery.consecutiveDays >= step;
                return (
                  <div
                    key={step}
                    style={{
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: isFilled ? '#059669' : '#e2e8f0',
                      transition: 'background-color 0.3s ease',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '18px',
            }}
          >
            <button
              onClick={() => setActiveTab('vitals')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'vitals' ? '2px solid var(--primary-700)' : '2px solid transparent',
                color: activeTab === 'vitals' ? 'var(--primary-800)' : 'var(--text-muted)',
                fontWeight: activeTab === 'vitals' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <Thermometer size={16} />
              Temperature History ({patient.temperatures?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('visits')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'visits' ? '2px solid var(--primary-700)' : '2px solid transparent',
                color: activeTab === 'visits' ? 'var(--primary-800)' : 'var(--text-muted)',
                fontWeight: activeTab === 'visits' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <Stethoscope size={16} />
              Doctor Visits ({patient.doctorVisits?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'overview' ? '2px solid var(--primary-700)' : '2px solid transparent',
                color: activeTab === 'overview' ? 'var(--primary-800)' : 'var(--text-muted)',
                fontWeight: activeTab === 'overview' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <FileText size={16} />
              Admission & Case Notes
            </button>
          </div>

          {/* TAB 1: Temperature History */}
          {activeTab === 'vitals' && (
            <div>
              {patient.temperatures && patient.temperatures.length > 0 ? (
                <div className="timeline">
                  {[...patient.temperatures].reverse().map((t) => (
                    <div key={t.id} className="timeline-item">
                      <div className={`timeline-dot ${t.isFever ? 'fever' : ''}`} />
                      <div className="timeline-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: t.isFever ? '#dc2626' : '#059669' }}>
                              {t.value}°C
                            </span>
                            <span className={`status-pill ${t.isFever ? 'status-fever' : 'status-normal'}`}>
                              {t.isFever ? 'Fever Spike' : 'Normal / Afebrile'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {formatReadableDate(t.date)} at {t.date.substring(11, 16) || 'Morning Round'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Recorded by: <strong>{t.recordedBy}</strong>
                        </div>
                        {t.notes && (
                          <div style={{ fontSize: '0.82rem', marginTop: '6px', color: '#334155' }}>
                            "{t.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No temperature records logged yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Doctor Visits History */}
          {activeTab === 'visits' && (
            <div>
              {patient.doctorVisits && patient.doctorVisits.length > 0 ? (
                <div className="timeline">
                  {[...patient.doctorVisits].reverse().map((v) => (
                    <div key={v.id} className="timeline-item">
                      <div className="timeline-dot" style={{ borderColor: '#7e22ce' }} />
                      <div className="timeline-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#6b21a8' }}>
                            {v.doctorName}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {formatReadableDate(v.date)}
                          </span>
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                            Medical Observations:
                          </div>
                          <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginTop: '2px' }}>
                            {v.observations}
                          </div>
                        </div>
                        {v.treatmentNotes && (
                          <div style={{ marginTop: '8px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                              Treatment & Rx:
                            </div>
                            <div style={{ fontSize: '0.84rem', color: '#047857', marginTop: '2px' }}>
                              {v.treatmentNotes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No physician visits recorded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Admission & Case Notes */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>DIAGNOSIS</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{patient.diagnosis}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>ADMISSION DATE</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{formatReadableDate(patient.admissionDate)}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONTACT NUMBER</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{patient.contact || 'N/A'}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMERGENCY CONTACT</div>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{patient.emergencyContact || 'N/A'}</div>
                </div>
              </div>

              {/* Recommendation Callout if present */}
              {patient.dischargeRecommended && (
                <div style={{ padding: '14px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontWeight: 700, fontSize: '0.88rem' }}>
                    <ShieldCheck size={16} />
                    Discharge Recommendation Logged
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af', marginTop: '4px' }}>
                    Recommended by: {patient.recommendedByDoctor} on {formatReadableDate(patient.recommendedDate)}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#1e3a8a', marginTop: '4px', fontStyle: 'italic' }}>
                    "{patient.recommendationNotes}"
                  </div>
                </div>
              )}

              {/* Discharged Notice */}
              {patient.status === 'Discharged' && (
                <div style={{ padding: '14px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontWeight: 700, color: '#065f46' }}>Discharge Finalized on {formatReadableDate(patient.dischargeDate)}</div>
                  <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '4px' }}>
                    Processed by: {patient.processedByAdmin || 'Administration'} • Room {patient.previousRoom} released.
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#064e3b', marginTop: '4px' }}>
                    Notes: {patient.dischargeNotes}
                  </div>
                </div>
              )}

              {/* Deceased Notice */}
              {patient.status === 'Deceased' && (
                <div style={{ padding: '14px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 700, color: '#991b1b' }}>Clinical Demise on {formatReadableDate(patient.dateOfDeath)}</div>
                  <div style={{ fontSize: '0.82rem', color: '#b91c1c', marginTop: '4px' }}>
                    Cause of Death: {patient.causeOfDeath}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7f1d1d', marginTop: '4px' }}>
                    Notes: {patient.deathNotes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with contextual action buttons */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {patient.status === 'Active' && currentRole === 'admin' && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  onClose();
                  onRecordDeath(patient.id);
                }}
              >
                <AlertOctagon size={14} />
                Record Demise
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>

            {patient.status === 'Active' && (
              <>
                {/* Nurse action: Record temperature if pending */}
                {!dailyStatus.hasTempToday && (currentRole === 'nurse' || currentRole === 'admin') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      onRecordTemp(patient.id);
                    }}
                  >
                    <Thermometer size={16} />
                    Record Temperature
                  </button>
                )}

                {/* Doctor action: Record Visit if temp is recorded & visit pending */}
                {dailyStatus.hasTempToday && !dailyStatus.hasVisitToday && (currentRole === 'doctor' || currentRole === 'admin') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      onRecordVisit(patient.id);
                    }}
                  >
                    <Stethoscope size={16} />
                    Conduct Doctor Visit
                  </button>
                )}

                {/* Doctor action: Recommend Discharge if eligible and not yet recommended */}
                {recovery.isEligible && !patient.dischargeRecommended && (currentRole === 'doctor' || currentRole === 'admin') && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      onClose();
                      onRecommendDischarge(patient.id);
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Recommend Discharge
                  </button>
                )}

                {/* Admin action: Process Discharge if recommended */}
                {patient.dischargeRecommended && (currentRole === 'admin') && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      onClose();
                      onProcessDischarge(patient.id);
                    }}
                  >
                    <ShieldCheck size={16} />
                    Authorize Final Discharge
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
