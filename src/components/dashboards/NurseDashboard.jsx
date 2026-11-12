import React from 'react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../common/MetricCard';
import PatientList from '../patients/PatientList';
import {
  Users,
  Thermometer,
  Clock,
  Stethoscope,
  CheckCircle2,
  Plus,
} from 'lucide-react';

export default function NurseDashboard({
  onViewDetails,
  onRecordTemp,
  initialFilter = 'all',
}) {
  const { hospitalMetrics } = useApp();

  return (
    <div>
      {/* Nurse Top Metric Cards */}
      <div className="stats-grid">
        <MetricCard
          label="Assigned Active Patients"
          value={hospitalMetrics.activeCount}
          subtext="Total quarantine beds monitored"
          icon={Users}
          variant="primary"
        />

        <MetricCard
          label="Temperature Recorded Today"
          value={hospitalMetrics.tempRecordedCount}
          subtext={`${hospitalMetrics.tempCompletionRate}% daily shift completion`}
          icon={CheckCircle2}
          variant="success"
        />

        <MetricCard
          label="Temperature Pending"
          value={hospitalMetrics.tempPendingCount}
          subtext="Requires daily vital measurement"
          icon={Clock}
          variant={hospitalMetrics.tempPendingCount > 0 ? 'warning' : 'success'}
        />

        <MetricCard
          label="Awaiting Doctor Rounds"
          value={hospitalMetrics.readyForDoctorCount}
          subtext="Temp recorded, cleared for doctor"
          icon={Stethoscope}
          variant="purple"
        />
      </div>

      {/* Patient Table with Record Temp Action */}
      <PatientList
        title="Nurse Station — Daily Temperature Tracking"
        subtitle="Record once-daily temperature per patient. Duplicate entries for the same calendar date are blocked."
        filterPreset={initialFilter}
        onViewDetails={onViewDetails}
        onRecordTemp={onRecordTemp}
      />
    </div>
  );
}
