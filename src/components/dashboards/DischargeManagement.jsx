import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  CheckCircle2,
  ShieldAlert,
  BedDouble,
  UserCheck,
  Calendar,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { formatReadableDate } from '../../utils/dateUtils';
import { calculateRecoveryProgress } from '../../utils/calculations';

export default function DischargeManagement({
  onViewDetails,
  onProcessDischarge,
}) {
  const { patients, feverThreshold, hospitalMetrics } = useApp();

  // Filter patients where doctor has recommended discharge but admin has not yet finalized
  const dischargeQueue = patients.filter(
    (p) => p.status === 'Active' && p.dischargeRecommended && !p.dischargeCompleted
  );

  return (
    <div>
      {/* Header Info Banner */}
      <div
        style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#d1fae5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileCheck2 size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#064e3b' }}>
              Administrative Discharge Authorizations
            </h3>
            <div style={{ fontSize: '0.84rem', color: '#047857', marginTop: '2px' }}>
              Patients cleared by attending physicians following 3 consecutive fever-free days. Confirming discharge releases their room back to the 74-bed capacity.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>AWAITING AUTHORIZATION</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46' }}>
              {dischargeQueue.length}
            </div>
          </div>
        </div>
      </div>

      {/* Discharge Queue List */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <span>Pending Discharge Reviews</span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#065f46',
                backgroundColor: '#ecfdf5',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {dischargeQueue.length} Recommended
            </span>
          </div>
        </div>

        {dischargeQueue.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} style={{ color: '#059669', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
              No Pending Discharge Authorizations
            </div>
            <div style={{ fontSize: '0.84rem', marginTop: '4px' }}>
              When a doctor clears a patient after 3 consecutive fever-free days, they will appear in this administrative queue for room release.
            </div>
          </div>
        ) : (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {dischargeQueue.map((patient) => {
              const recovery = calculateRecoveryProgress(patient.temperatures || [], feverThreshold);

              return (
                <div
                  key={patient.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px 20px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {patient.name}
                        </span>
                        <span className="status-pill status-active">
                          <BedDouble size={12} />
                          Room {patient.roomNumber}
                        </span>
                        <span className="status-pill status-done">
                          3/3 Fever-Free Days
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Patient ID: <strong>{patient.id}</strong> • Admitted: {formatReadableDate(patient.admissionDate)} • Age: {patient.age}y
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => onViewDetails(patient.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={14} />
                        Review History
                      </button>
                      <button
                        onClick={() => onProcessDischarge(patient.id)}
                        className="btn btn-success btn-sm"
                      >
                        <UserCheck size={14} />
                        Authorize Discharge & Release Room
                      </button>
                    </div>
                  </div>

                  {/* Doctor Recommendation Summary Callout */}
                  <div
                    style={{
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={14} />
                      Physician Clearance by {patient.recommendedByDoctor || 'Physician'} ({formatReadableDate(patient.recommendedDate)})
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#1e3a8a', marginTop: '4px' }}>
                      "{patient.recommendationNotes}"
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
