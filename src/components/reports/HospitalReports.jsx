import React from 'react';
import { useApp } from '../../context/AppContext';
import MetricCard from '../common/MetricCard';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Skull,
  Users,
  CheckCircle2,
  ShieldAlert,
  BedDouble,
  Info,
} from 'lucide-react';

export default function HospitalReports() {
  const { hospitalMetrics, cohortType, setCohortType, patients, feverThreshold } = useApp();

  const mortalityBenchmark = 15.0; // Benchmark: 15%
  const survivalBenchmark = 85.0;  // Benchmark: 85%

  const exceedsMortality = hospitalMetrics.mortalityRate > mortalityBenchmark;
  const meetsSurvival = hospitalMetrics.survivalRate >= survivalBenchmark;

  // Active status distribution
  const activeCount = patients.filter((p) => p.status === 'Active').length;
  const dischargedCount = patients.filter((p) => p.status === 'Discharged').length;
  const deceasedCount = patients.filter((p) => p.status === 'Deceased').length;
  const totalCount = patients.length;

  return (
    <div>
      {/* Benchmark Alert Banner */}
      {exceedsMortality ? (
        <div className="alert-banner alert-danger" style={{ marginBottom: '24px' }}>
          <ShieldAlert size={26} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '1rem' }}>
              CRITICAL FACILITY WARNING: Mortality Rate Exceeds 15% Benchmark!
            </strong>
            <div style={{ marginTop: '4px', fontSize: '0.86rem' }}>
              Current cohort mortality rate is <strong>{hospitalMetrics.mortalityRate}%</strong>, which is above the 15.0% quarantine facility upper threshold. Urgent clinical audit and triage review required.
            </div>
          </div>
        </div>
      ) : (
        <div className="alert-banner alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 size={24} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.96rem' }}>
              Facility Standards Compliant: Mortality Rate Within 15% Benchmark
            </strong>
            <div style={{ marginTop: '2px', fontSize: '0.84rem' }}>
              Current cohort mortality rate is <strong>{hospitalMetrics.mortalityRate}%</strong> (compliant with &le; 15.0% threshold). Survival rate is <strong>{hospitalMetrics.survivalRate}%</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Cohort Selector Header */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Quarantine Facility Performance & Cohort Analytics
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Tracking epidemiological survival and mortality against clinical regulatory standards.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Cohort Definition:
          </span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.84rem' }}
            value={cohortType}
            onChange={(e) => setCohortType(e.target.value)}
          >
            <option value="all">All Admitted Patients ({totalCount} total)</option>
            <option value="closed">Resolved Cases Only ({dischargedCount + deceasedCount} total)</option>
          </select>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="stats-grid">
        <MetricCard
          label="Defined Patient Cohort"
          value={hospitalMetrics.cohortTotal}
          subtext={cohortType === 'all' ? 'All patients admitted to facility' : 'Resolved outcomes (Discharged + Deceased)'}
          icon={Users}
          variant="primary"
        />

        <MetricCard
          label="Total Survivors (Discharged)"
          value={hospitalMetrics.totalDischarged}
          subtext={`Survival Rate: ${hospitalMetrics.survivalRate}%`}
          icon={TrendingUp}
          variant="success"
        />

        <MetricCard
          label="Total Demises (Deceased)"
          value={hospitalMetrics.totalDeceased}
          subtext={`Mortality Rate: ${hospitalMetrics.mortalityRate}%`}
          icon={Skull}
          variant={exceedsMortality ? 'danger' : 'default'}
        />

        <MetricCard
          label="Active Patients In Care"
          value={activeCount}
          subtext={`${hospitalMetrics.occupiedRooms}/74 rooms occupied`}
          icon={BedDouble}
          variant="info"
        />
      </div>

      {/* Benchmark Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Mortality Benchmark Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={18} style={{ color: exceedsMortality ? '#dc2626' : '#059669' }} />
              <span>Mortality Rate vs 15% Benchmark</span>
            </div>
            <span
              className={`status-pill ${exceedsMortality ? 'status-fever' : 'status-done'}`}
            >
              {exceedsMortality ? 'EXCEEDS 15% THRESHOLD' : 'COMPLIANT WITH BENCHMARK'}
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: exceedsMortality ? '#dc2626' : '#047857' }}>
                  {hospitalMetrics.mortalityRate}%
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  actual mortality ({hospitalMetrics.totalDeceased} of {hospitalMetrics.cohortTotal})
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                Benchmark Limit: &le; 15.0%
              </div>
            </div>

            {/* Visual Comparison Bar */}
            <div className="benchmark-progress-bar" style={{ height: '14px', borderRadius: '7px' }}>
              <div
                className="benchmark-fill"
                style={{
                  width: `${Math.min(100, (hospitalMetrics.mortalityRate / 30) * 100)}%`,
                  backgroundColor: exceedsMortality ? '#dc2626' : '#059669',
                }}
              />
              {/* 15% marker (at 50% of the 30% scale) */}
              <div
                className="benchmark-marker"
                style={{ left: '50%' }}
                title="15% Benchmark Line"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              <span>0%</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>15% Standard Benchmark</span>
              <span>30%+</span>
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Calculated as: <code>Deaths ({hospitalMetrics.totalDeceased}) &divide; Defined Cohort ({hospitalMetrics.cohortTotal}) &times; 100</code>.
            </div>
          </div>
        </div>

        {/* Survival Benchmark Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} style={{ color: meetsSurvival ? '#059669' : '#d97706' }} />
              <span>Survival Rate vs 85% Benchmark</span>
            </div>
            <span
              className={`status-pill ${meetsSurvival ? 'status-done' : 'status-pending'}`}
            >
              {meetsSurvival ? 'BENCHMARK MET (≥ 85%)' : 'BELOW 85% TARGET'}
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: meetsSurvival ? '#059669' : '#d97706' }}>
                  {hospitalMetrics.survivalRate}%
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                  actual survival ({hospitalMetrics.totalDischarged} of {hospitalMetrics.cohortTotal})
                </span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                Benchmark Target: &ge; 85.0%
              </div>
            </div>

            {/* Visual Comparison Bar */}
            <div className="benchmark-progress-bar" style={{ height: '14px', borderRadius: '7px' }}>
              <div
                className="benchmark-fill"
                style={{
                  width: `${Math.min(100, hospitalMetrics.survivalRate)}%`,
                  backgroundColor: meetsSurvival ? '#059669' : '#f59e0b',
                }}
              />
              {/* 85% marker */}
              <div
                className="benchmark-marker"
                style={{ left: '85%' }}
                title="85% Benchmark Target"
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
              <span>0%</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>85% Target Line</span>
              <span>100%</span>
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.82rem', color: 'var(--text-muted)', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px' }}>
              <Info size={14} style={{ display: 'inline', marginRight: '4px' }} />
              Calculated as: <code>Discharged Survivors ({hospitalMetrics.totalDischarged}) &divide; Defined Cohort ({hospitalMetrics.cohortTotal}) &times; 100</code>.
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Breakdown & Capacity Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Outcome Breakdown Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BarChart3 size={18} />
              <span>Patient Outcome Distribution</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Active */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                    Active in Quarantine
                  </span>
                  <span>{activeCount} patients ({totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalCount > 0 ? (activeCount / totalCount) * 100 : 0}%`, backgroundColor: '#2563eb' }} />
                </div>
              </div>

              {/* Discharged Survivors */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669' }} />
                    Discharged (Survivors)
                  </span>
                  <span>{dischargedCount} patients ({totalCount > 0 ? Math.round((dischargedCount / totalCount) * 100) : 0}%)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalCount > 0 ? (dischargedCount / totalCount) * 100 : 0}%`, backgroundColor: '#059669' }} />
                </div>
              </div>

              {/* Deceased */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 600, marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                    Demises (Deceased)
                  </span>
                  <span>{deceasedCount} patients ({totalCount > 0 ? Math.round((deceasedCount / totalCount) * 100) : 0}%)</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalCount > 0 ? (deceasedCount / totalCount) * 100 : 0}%`, backgroundColor: '#dc2626' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BedDouble size={18} />
              <span>Facility Capacity Utilization (74 Beds)</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                {hospitalMetrics.occupiedRooms} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 74</span>
              </div>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Beds currently occupied ({hospitalMetrics.capacityPercentage}% utilization)
              </div>
            </div>

            <div style={{ height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', margin: '16px 0' }}>
              <div
                style={{
                  height: '100%',
                  width: `${hospitalMetrics.capacityPercentage}%`,
                  backgroundColor: hospitalMetrics.occupiedRooms >= 70 ? '#dc2626' : 'var(--primary-600)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Available Beds: <strong>{hospitalMetrics.availableRooms}</strong></span>
              <span>Safety Headroom: <strong>{74 - hospitalMetrics.occupiedRooms}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
