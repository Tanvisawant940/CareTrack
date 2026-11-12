import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Thermometer,
  Stethoscope,
  FileCheck2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  BedDouble,
  User,
  Plus,
} from 'lucide-react';
import { getPatientDailyStatus, calculateRecoveryProgress } from '../../utils/calculations';

export default function PatientList({
  filterPreset = 'all',
  title = 'Patient Directory',
  subtitle,
  onViewDetails,
  onRecordTemp,
  onRecordVisit,
  onRecommendDischarge,
  onProcessDischarge,
  onAddNewPatient,
}) {
  const { patients, currentDate, feverThreshold, currentRole } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(filterPreset);

  const filteredPatients = patients.filter((patient) => {
    // Search query match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      patient.name.toLowerCase().includes(q) ||
      patient.id.toLowerCase().includes(q) ||
      (patient.roomNumber && patient.roomNumber.toString().includes(q));

    if (!matchesSearch) return false;

    const dailyStatus = getPatientDailyStatus(patient, currentDate, feverThreshold);

    // Status filter match
    if (statusFilter === 'active') {
      return patient.status === 'Active';
    }
    if (statusFilter === 'pending-temp') {
      return patient.status === 'Active' && !dailyStatus.hasTempToday;
    }
    if (statusFilter === 'ready-doctor') {
      return patient.status === 'Active' && dailyStatus.hasTempToday && !dailyStatus.hasVisitToday;
    }
    if (statusFilter === 'visit-done') {
      return patient.status === 'Active' && dailyStatus.hasVisitToday;
    }
    if (statusFilter === 'recovery-eligible') {
      return patient.status === 'Active' && dailyStatus.recovery.isEligible;
    }
    if (statusFilter === 'discharge-recommended') {
      return patient.status === 'Active' && patient.dischargeRecommended;
    }
    if (statusFilter === 'discharged') {
      return patient.status === 'Discharged';
    }
    if (statusFilter === 'deceased') {
      return patient.status === 'Deceased';
    }

    return true; // 'all'
  });

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="card-title">
            <span>{title}</span>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: 'var(--primary-700)',
                backgroundColor: 'var(--primary-50)',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {filteredPatients.length} Patients
            </span>
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </div>
          )}
        </div>

        {onAddNewPatient && currentRole === 'admin' && (
          <button onClick={onAddNewPatient} className="btn btn-primary btn-sm">
            <Plus size={16} />
            Admit Patient
          </button>
        )}
      </div>

      <div style={{ padding: '16px 20px 0' }}>
        {/* Search & Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, patient ID, or room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.84rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Patients ({patients.length})</option>
              <option value="active">Active in Quarantine</option>
              <option value="pending-temp">Pending Temperature Today</option>
              <option value="ready-doctor">Ready for Doctor Visit</option>
              <option value="visit-done">Doctor Visit Completed Today</option>
              <option value="recovery-eligible">Eligible for Recovery (3/3 Days)</option>
              <option value="discharge-recommended">Discharge Recommended</option>
              <option value="discharged">Discharged (Survivors)</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Room</th>
              <th>Today's Temp</th>
              <th>Doctor Visit</th>
              <th>3-Day Recovery</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  No patients match the selected search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => {
                const dailyStatus = getPatientDailyStatus(patient, currentDate, feverThreshold);
                const recovery = dailyStatus.recovery;

                return (
                  <tr key={patient.id}>
                    {/* Patient Name & ID */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-100)',
                            color: 'var(--primary-800)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            flexShrink: 0,
                          }}
                        >
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {patient.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {patient.id} • {patient.age}y {patient.gender.slice(0, 1)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Room */}
                    <td>
                      {patient.roomNumber ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            color: 'var(--primary-900)',
                            fontSize: '0.86rem',
                          }}
                        >
                          <BedDouble size={14} style={{ color: 'var(--primary-600)' }} />
                          {patient.roomNumber}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Released ({patient.previousRoom})
                        </span>
                      )}
                    </td>

                    {/* Today's Temperature */}
                    <td>
                      {patient.status !== 'Active' ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>—</span>
                      ) : dailyStatus.hasTempToday ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            className={`status-pill ${dailyStatus.todayTempEntry.isFever ? 'status-fever' : 'status-normal'}`}
                            style={{ fontSize: '0.78rem', padding: '2px 8px' }}
                          >
                            <Thermometer size={12} />
                            {dailyStatus.todayTempEntry.value}°C
                          </span>
                          {dailyStatus.todayTempEntry.isFever && (
                            <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>
                              Fever
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="status-pill status-pending" style={{ fontSize: '0.76rem' }}>
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Doctor Visit Status */}
                    <td>
                      {patient.status !== 'Active' ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>—</span>
                      ) : dailyStatus.hasVisitToday ? (
                        <span className="status-pill status-done" style={{ fontSize: '0.76rem' }}>
                          <CheckCircle2 size={12} />
                          Completed
                        </span>
                      ) : dailyStatus.hasTempToday ? (
                        <span className="status-pill status-recommended" style={{ fontSize: '0.76rem' }}>
                          <Stethoscope size={12} />
                          Ready for Visit
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          Awaiting Temp
                        </span>
                      )}
                    </td>

                    {/* 3-Day Recovery Streak */}
                    <td>
                      {patient.status !== 'Active' ? (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                          {patient.status === 'Discharged' ? 'Fully Recovered' : 'N/A'}
                        </span>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div className="recovery-meter">
                              {[1, 2, 3].map((step) => (
                                <div
                                  key={step}
                                  className={`recovery-dot ${recovery.consecutiveDays >= step ? 'filled' : ''}`}
                                />
                              ))}
                            </div>
                            <span
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                color: recovery.isEligible ? '#065f46' : 'var(--text-muted)',
                              }}
                            >
                              {recovery.consecutiveDays}/3
                            </span>
                          </div>
                          {recovery.isEligible && (
                            <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
                              Eligible for Review
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td>
                      {patient.status === 'Discharged' && (
                        <span className="status-pill status-discharged">Discharged</span>
                      )}
                      {patient.status === 'Deceased' && (
                        <span className="status-pill status-deceased">Deceased</span>
                      )}
                      {patient.status === 'Active' && patient.dischargeRecommended && (
                        <span className="status-pill status-recommended">Discharge Ready</span>
                      )}
                      {patient.status === 'Active' && !patient.dischargeRecommended && (
                        <span className="status-pill status-active">Active</span>
                      )}
                    </td>

                    {/* Contextual Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* View Details button (always available) */}
                        <button
                          onClick={() => onViewDetails(patient.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="View Patient Chart"
                        >
                          <Eye size={14} />
                          Details
                        </button>

                        {/* Nurse quick action: Record Temp */}
                        {patient.status === 'Active' && !dailyStatus.hasTempToday && onRecordTemp && (currentRole === 'nurse' || currentRole === 'admin') && (
                          <button
                            onClick={() => onRecordTemp(patient.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 10px' }}
                          >
                            <Thermometer size={14} />
                            Log Temp
                          </button>
                        )}

                        {/* Doctor quick action: Record Visit */}
                        {patient.status === 'Active' && dailyStatus.hasTempToday && !dailyStatus.hasVisitToday && onRecordVisit && (currentRole === 'doctor' || currentRole === 'admin') && (
                          <button
                            onClick={() => onRecordVisit(patient.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 10px', backgroundColor: '#7e22ce', borderColor: '#6b21a8' }}
                          >
                            <Stethoscope size={14} />
                            Visit
                          </button>
                        )}

                        {/* Doctor quick action: Recommend Discharge */}
                        {patient.status === 'Active' && recovery.isEligible && !patient.dischargeRecommended && onRecommendDischarge && (currentRole === 'doctor' || currentRole === 'admin') && (
                          <button
                            onClick={() => onRecommendDischarge(patient.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 10px', backgroundColor: '#0284c7', borderColor: '#0369a1' }}
                            title="Eligible for discharge after 3 fever-free days"
                          >
                            <FileCheck2 size={14} />
                            Recommend
                          </button>
                        )}

                        {/* Admin quick action: Authorize Final Discharge */}
                        {patient.status === 'Active' && patient.dischargeRecommended && onProcessDischarge && (currentRole === 'admin') && (
                          <button
                            onClick={() => onProcessDischarge(patient.id)}
                            className="btn btn-success btn-sm"
                            style={{ padding: '4px 10px' }}
                          >
                            <CheckCircle2 size={14} />
                            Discharge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
