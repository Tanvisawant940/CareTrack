import React from 'react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../common/MetricCard';
import PatientList from '../patients/PatientList';
import {
  Users,
  Stethoscope,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
} from 'lucide-react';

export default function DoctorDashboard({
  onViewDetails,
  onRecordVisit,
  onRecommendDischarge,
  initialFilter = 'all',
}) {
  const { hospitalMetrics } = useApp();

  return (
    <div>
      {/* Doctor Top Metric Cards */}
      <div className="stats-grid">
        <MetricCard
          label="Total Active Patients"
          value={hospitalMetrics.activeCount}
          subtext="Under quarantine supervision"
          icon={Users}
          variant="primary"
        />

        <MetricCard
          label="Ready for Doctor Visit"
          value={hospitalMetrics.readyForDoctorCount}
          subtext="Temp recorded, visit pending"
          icon={Stethoscope}
          variant="info"
        />

        <MetricCard
          label="Visits Completed Today"
          value={hospitalMetrics.visitRecordedCount}
          subtext={`${hospitalMetrics.visitCompletionRate}% rounds completed`}
          icon={CheckCircle2}
          variant="success"
        />

        <MetricCard
          label="Eligible for Recovery Review"
          value={hospitalMetrics.eligibleForRecoveryCount}
          subtext="3/3 fever-free days completed"
          icon={FileCheck2}
          variant="purple"
        />
      </div>

      {/* Protocol Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <AlertCircle size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#1e40af' }}>
          <strong>Clinical Workflow Protocol:</strong> Doctor visits cannot be conducted until today's patient temperature is officially recorded by nursing staff. Discharge can be recommended once a patient maintains 3 consecutive complete fever-free days.
        </div>
      </div>

      {/* Patient Table with Record Visit and Recommend Discharge Actions */}
      <PatientList
        title="Physician Rounds & Recovery Management"
        subtitle="Review clinical vitals, record daily observations and treatments, and recommend recovered patients for discharge"
        filterPreset={initialFilter}
        onViewDetails={onViewDetails}
        onRecordVisit={onRecordVisit}
        onRecommendDischarge={onRecommendDischarge}
      />
    </div>
  );
}
