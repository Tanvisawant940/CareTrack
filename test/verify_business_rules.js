/**
 * Automated Verification Script for CareTrack Clinical Business Logic
 * Run with: node test/verify_business_rules.js
 */

import {
  checkIsFever,
  calculateRecoveryProgress,
  getPatientDailyStatus,
  calculateHospitalMetrics,
} from '../src/utils/calculations.js';
import { getTodayString, getDaysAgoDate } from '../src/utils/dateUtils.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n--- 1. Testing Configurable Fever Threshold ---');
assert(checkIsFever(37.5, 37.5) === true, '37.5°C with 37.5°C threshold is fever');
assert(checkIsFever(37.4, 37.5) === false, '37.4°C with 37.5°C threshold is afebrile (normal)');
assert(checkIsFever(37.8, 38.0) === false, '37.8°C with 38.0°C threshold is normal');
assert(checkIsFever(38.1, 38.0) === true, '38.1°C with 38.0°C threshold is fever');

console.log('\n--- 2. Testing 3 Consecutive Fever-Free Days Recovery Rule ---');
const d0 = '2026-11-12';
const d1 = '2026-11-11';
const d2 = '2026-11-10';
const d3 = '2026-11-09';
const d4 = '2026-11-08';

// Case A: Exactly 3 consecutive fever-free days
const caseA = [
  { date: `${d2}T08:00:00`, value: 36.6 },
  { date: `${d1}T08:00:00`, value: 36.7 },
  { date: `${d0}T08:00:00`, value: 36.5 },
];
const resA = calculateRecoveryProgress(caseA, 37.5);
assert(resA.consecutiveDays === 3, 'Consecutive days equals 3');
assert(resA.isEligible === true, 'Eligible for recovery review is true');

// Case B: Fever on Day 2 resets the count
const caseB = [
  { date: `${d3}T08:00:00`, value: 36.6 },
  { date: `${d2}T08:00:00`, value: 36.5 },
  { date: `${d1}T08:00:00`, value: 38.5 }, // Fever spike!
  { date: `${d0}T08:00:00`, value: 36.8 }, // Normal again
];
const resB = calculateRecoveryProgress(caseB, 37.5);
assert(resB.consecutiveDays === 1, 'Fever reset recovery streak to 0, followed by 1 normal day = 1');
assert(resB.isEligible === false, 'Patient is not eligible after fever reset');

// Case C: Missing day gap breaks consecutive continuity
const caseC = [
  { date: `${d4}T08:00:00`, value: 36.5 },
  // d3 is missing!
  { date: `${d2}T08:00:00`, value: 36.6 },
  { date: `${d1}T08:00:00`, value: 36.7 },
];
const resC = calculateRecoveryProgress(caseC, 37.5);
assert(resC.consecutiveDays === 2, 'Missing day broke streak; current streak is 2');
assert(resC.isEligible === false, 'Patient is not eligible due to missing day');

console.log('\n--- 3. Testing Daily Protocol (Temp Required Before Doctor Visit) ---');
const testPatientNoTemp = {
  id: 'PT-TEST',
  name: 'Test Patient',
  status: 'Active',
  temperatures: [],
  doctorVisits: [],
};
const dailyStatusNoTemp = getPatientDailyStatus(testPatientNoTemp, d0, 37.5);
assert(dailyStatusNoTemp.hasTempToday === false, 'hasTempToday is false');
assert(dailyStatusNoTemp.isReadyForDoctorVisit === false, 'isReadyForDoctorVisit is false when temperature is pending');

const testPatientWithTemp = {
  id: 'PT-TEST',
  name: 'Test Patient',
  status: 'Active',
  temperatures: [{ date: `${d0}T08:00:00`, value: 36.8, isFever: false }],
  doctorVisits: [],
};
const dailyStatusWithTemp = getPatientDailyStatus(testPatientWithTemp, d0, 37.5);
assert(dailyStatusWithTemp.hasTempToday === true, 'hasTempToday is true');
assert(dailyStatusWithTemp.isReadyForDoctorVisit === true, 'isReadyForDoctorVisit is true after temperature recorded');

console.log('\n--- 4. Testing Hospital Capacity (74-patient limit) and Benchmark Metrics ---');
const mockPatients = [];
for (let i = 1; i <= 74; i++) {
  mockPatients.push({
    id: `PT-${i}`,
    status: 'Active',
    roomNumber: `${i}`,
    temperatures: [],
    doctorVisits: [],
  });
}
// Add 2 discharged and 2 deceased
mockPatients.push({ id: 'PT-D1', status: 'Discharged', roomNumber: null });
mockPatients.push({ id: 'PT-D2', status: 'Discharged', roomNumber: null });
mockPatients.push({ id: 'PT-X1', status: 'Deceased', roomNumber: null });
mockPatients.push({ id: 'PT-X2', status: 'Deceased', roomNumber: null });

const metrics = calculateHospitalMetrics(mockPatients, d0, 37.5, 'all');
assert(metrics.maxCapacity === 74, 'Max capacity is 74');
assert(metrics.occupiedRooms === 74, 'Occupied rooms equals 74 active patients');
assert(metrics.availableRooms === 0, 'Available rooms is 0 at full capacity');
assert(metrics.capacityPercentage === 100, 'Capacity percentage is 100%');
assert(metrics.totalDischarged === 2, '2 discharged survivors');
assert(metrics.totalDeceased === 2, '2 deaths');
// Total cohort = 74 + 2 + 2 = 78. Mortality = 2/78 = 2.56%
assert(metrics.mortalityRate === 2.6, 'Mortality rate is 2.6%');
assert(metrics.exceedsMortalityBenchmark === false, 'Mortality 2.6% is within 15% benchmark');

// Test Mortality exceeding 15% alert
const highMortalityCohort = [
  { id: 'PT-1', status: 'Active', roomNumber: '101' },
  { id: 'PT-2', status: 'Discharged', roomNumber: null },
  { id: 'PT-3', status: 'Deceased', roomNumber: null },
  { id: 'PT-4', status: 'Deceased', roomNumber: null }, // 2 deaths out of 4 = 50%
];
const alertMetrics = calculateHospitalMetrics(highMortalityCohort, d0, 37.5, 'all');
assert(alertMetrics.mortalityRate === 50.0, 'Mortality rate is 50.0%');
assert(alertMetrics.exceedsMortalityBenchmark === true, 'exceedsMortalityBenchmark is true when > 15%');

console.log(`\n========================================`);
console.log(`RESULTS: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
