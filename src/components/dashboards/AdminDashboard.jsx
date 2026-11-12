import React from 'react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../common/MetricCard';
import PatientList from '../patients/PatientList';
import {
  Users,
  BedDouble,
  Thermometer,
  Stethoscope,
  FileCheck2,
  AlertTriangle,
  Skull,
  TrendingUp,
  ShieldAlert,
  Plus,
} from 'lucide-react';

export default function AdminDashboard({
  onViewDetails,
  onRecordTemp,
  onRecordVisit,
  onRecommendDischarge,
  onProcessDischarge,
  onAddNewPatient,
}) {
  const { hospitalMetrics } = useApp();

  return (
    <div>
      {/* 15% Mortality Rate Alert Warning (Rule 16) */}
      {hospitalMetrics.exceedsMortalityBenchmark && (
        <div className="alert-banner alert-danger" style={{ marginBottom: '24px' }}>
          <ShieldAlert size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.98rem' }}>
              CRITICAL BENCHMARK ALERT: Facility Mortality Rate Exceeds 15% Threshold!
            </strong>
            <div style={{ marginTop: '4px', fontSize: '0.85rem' }}>
              Current cohort mortality is <strong>{hospitalMetrics.mortalityRate}%</strong> (Target benchmark &le; 15.0%). Facility clinical oversight review required.
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="stats-grid">
        {/* Active Patients */}
        <MetricCard
          label="Active Patients"
          value={hospitalMetrics.activeCount}
          subtext={`In quarantine care`}
          icon={Users}
          variant="primary"
        />

        {/* Room Capacity */}
        <MetricCard
          label="Room Occupancy"
          value={`${hospitalMetrics.occupiedRooms} / ${hospitalMetrics.maxCapacity}`}
          subtext={`${hospitalMetrics.availableRooms} rooms currently available`}
          icon={BedDouble}
          variant={hospitalMetrics.occupiedRooms >= 70 ? 'danger' : 'success'}
          badge={{
            text: `${hospitalMetrics.capacityPercentage}% Capacity`,
            bg: hospitalMetrics.occupiedRooms >= 70 ? '#fef2f2' : '#f0fdf4',
            color: hospitalMetrics.occupiedRooms >= 70 ? '#dc2626' : '#166534',
          }}
        />

        {/* Daily Temp Completion */}
        <MetricCard
          label="Today's Temperature"
          value={`${hospitalMetrics.tempCompletionRate}%`}
          subtext={`${hospitalMetrics.tempRecordedCount} recorded • ${hospitalMetrics.tempPendingCount} pending`}
          icon={Thermometer}
          variant={hospitalMetrics.tempPendingCount > 0 ? 'warning' : 'success'}
        />

        {/* Daily Doctor Visits */}
        <MetricCard
          label="Today's Doctor Visits"
          value={`${hospitalMetrics.visitCompletionRate}%`}
          subtext={`${hospitalMetrics.visitRecordedCount} of ${hospitalMetrics.activeCount} completed`}
          icon={Stethoscope}
          variant="purple"
        />
      </div>

      {/* Secondary Benchmark & Review Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {/* Discharge Reviews */}
        <MetricCard
          label="Discharge Queue"
          value={hospitalMetrics.recommendedForDischargeCount}
          subtext="Cleared by physician, awaiting admin"
          icon={FileCheck2}
          variant="info"
        />

        {/* Total Deaths */}
        <MetricCard
          label="Total Deaths"
          value={hospitalMetrics.totalDeceased}
          subtext={`Mortality: ${hospitalMetrics.mortalityRate}%`}
          icon={Skull}
          variant={hospitalMetrics.exceedsMortalityBenchmark ? 'danger' : 'default'}
        />

        {/* Survival Rate */}
        <MetricCard
          label="Survival Rate"
          value={`${hospitalMetrics.survivalRate}%`}
          subtext={`${hospitalMetrics.totalDischarged} discharged survivors (Benchmark 85%)`}
          icon={TrendingUp}
          variant="success"
        />

        {/* Mortality Rate Benchmark */}
        <MetricCard
          label="Mortality Rate"
          value={`${hospitalMetrics.mortalityRate}%`}
          subtext={hospitalMetrics.exceedsMortalityBenchmark ? '⚠️ Exceeds 15% Benchmark' : '✅ Within 15% Benchmark'}
          icon={AlertTriangle}
          variant={hospitalMetrics.exceedsMortalityBenchmark ? 'danger' : 'success'}
        />
      </div>

      {/* Main Patient Directory Table */}
      <PatientList
        title="Quarantine Facility Patient Management"
        subtitle="Live roster of all active quarantine beds, pending daily rounds, and discharge queues"
        filterPreset="all"
        onViewDetails={onViewDetails}
        onRecordTemp={onRecordTemp}
        onRecordVisit={onRecordVisit}
        onRecommendDischarge={onRecommendDischarge}
        onProcessDischarge={onProcessDischarge}
        onAddNewPatient={onAddNewPatient}
      />
    </div>
  );
}
