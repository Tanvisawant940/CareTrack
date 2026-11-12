/**
 * Core Clinical & Hospital Performance Calculations for CareTrack
 */

/**
 * Checks whether a temperature reading is classified as a fever
 * based on the facility's configurable threshold.
 */
export function checkIsFever(temperature, threshold = 37.5) {
  if (temperature === null || temperature === undefined) return false;
  const tempNum = parseFloat(temperature);
  return tempNum >= parseFloat(threshold);
}

/**
 * Calculates consecutive complete fever-free days for a patient.
 * Business Rules:
 * 1. 3 complete consecutive fever-free days required for recovery review.
 * 2. A fever on any day immediately resets the recovery counter to 0.
 * 3. A missing temperature record between days breaks consecutive continuity.
 * 4. Only 1 official temperature entry per calendar day is counted.
 */
export function calculateRecoveryProgress(temperatures = [], threshold = 37.5) {
  if (!temperatures || temperatures.length === 0) {
    return {
      consecutiveDays: 0,
      isEligible: false,
      lastStreakDates: [],
      breakReason: 'No temperature records',
    };
  }

  // Deduplicate and get one entry per calendar date, sorted ascending
  const dailyMap = new Map();
  temperatures.forEach((entry) => {
    const dateKey = entry.date.substring(0, 10);
    // Take the official recorded entry for the date
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, entry);
    }
  });

  const sortedDates = Array.from(dailyMap.keys()).sort();

  let streak = 0;
  let streakDates = [];
  let prevDateObj = null;

  for (const dateKey of sortedDates) {
    const entry = dailyMap.get(dateKey);
    const tempVal = parseFloat(entry.value);
    const isFever = checkIsFever(tempVal, threshold);

    const currentDateObj = new Date(dateKey + 'T00:00:00');

    // Check calendar continuity (must be strictly the consecutive day)
    if (prevDateObj) {
      const diffTime = currentDateObj.getTime() - prevDateObj.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        // Missing day gap - breaks consecutive chain
        streak = 0;
        streakDates = [];
      }
    }

    if (isFever) {
      // Fever resets the streak to 0
      streak = 0;
      streakDates = [];
    } else {
      // Fever-free day adds to the streak
      streak += 1;
      streakDates.push({
        date: dateKey,
        temp: tempVal,
      });
    }

    prevDateObj = currentDateObj;
  }

  const cappedStreak = Math.min(3, streak);

  return {
    consecutiveDays: cappedStreak,
    isEligible: cappedStreak >= 3,
    lastStreakDates: streakDates.slice(-3),
    rawStreak: streak,
  };
}

/**
 * Checks today's status for a patient given a specific current date
 */
export function getPatientDailyStatus(patient, currentDate, threshold = 37.5) {
  const dateKey = currentDate.substring(0, 10);

  const todayTemp = patient.temperatures?.find(
    (t) => t.date.substring(0, 10) === dateKey
  );

  const todayVisit = patient.doctorVisits?.find(
    (v) => v.date.substring(0, 10) === dateKey
  );

  const recovery = calculateRecoveryProgress(patient.temperatures || [], threshold);

  return {
    hasTempToday: !!todayTemp,
    todayTempEntry: todayTemp || null,
    hasVisitToday: !!todayVisit,
    todayVisitEntry: todayVisit || null,
    isReadyForDoctorVisit: !!todayTemp && !todayVisit && patient.status === 'Active',
    isTempPending: !todayTemp && patient.status === 'Active',
    recovery,
    isEligibleForDischarge: recovery.isEligible && patient.status === 'Active',
  };
}

/**
 * Calculates overall hospital capacity and metrics
 */
export function calculateHospitalMetrics(patients = [], currentDate, threshold = 37.5, cohortType = 'all') {
  const MAX_CAPACITY = 74;

  const activePatients = patients.filter((p) => p.status === 'Active');
  const occupiedRooms = activePatients.length;
  const availableRooms = Math.max(0, MAX_CAPACITY - occupiedRooms);

  // Today's daily operational metrics for active patients
  let tempRecordedCount = 0;
  let visitRecordedCount = 0;
  let readyForDoctorCount = 0;
  let recommendedForDischargeCount = 0;
  let eligibleForRecoveryCount = 0;

  activePatients.forEach((patient) => {
    const status = getPatientDailyStatus(patient, currentDate, threshold);
    if (status.hasTempToday) tempRecordedCount++;
    if (status.hasVisitToday) visitRecordedCount++;
    if (status.isReadyForDoctorVisit) readyForDoctorCount++;
    if (status.recovery.isEligible) eligibleForRecoveryCount++;
    if (patient.dischargeRecommended && !patient.dischargeCompleted) {
      recommendedForDischargeCount++;
    }
  });

  const totalPatientsCount = patients.length;
  const totalDischarged = patients.filter((p) => p.status === 'Discharged').length;
  const totalDeceased = patients.filter((p) => p.status === 'Deceased').length;

  // Cohort calculation:
  // Option 'all': All admitted patients historically (Total = Active + Discharged + Deceased)
  // Option 'closed': Resolved cases only (Discharged + Deceased)
  const cohortTotal = cohortType === 'closed' 
    ? (totalDischarged + totalDeceased)
    : totalPatientsCount;

  const mortalityRate = cohortTotal > 0 
    ? ((totalDeceased / cohortTotal) * 100) 
    : 0;

  const survivalRate = cohortTotal > 0 
    ? ((totalDischarged / cohortTotal) * 100) 
    : 0;

  const exceedsMortalityBenchmark = mortalityRate > 15.0;

  const tempCompletionRate = activePatients.length > 0 
    ? Math.round((tempRecordedCount / activePatients.length) * 100) 
    : 100;

  const visitCompletionRate = activePatients.length > 0 
    ? Math.round((visitRecordedCount / activePatients.length) * 100) 
    : 100;

  return {
    maxCapacity: MAX_CAPACITY,
    occupiedRooms,
    availableRooms,
    capacityPercentage: Math.round((occupiedRooms / MAX_CAPACITY) * 100),
    activeCount: activePatients.length,
    tempRecordedCount,
    tempPendingCount: Math.max(0, activePatients.length - tempRecordedCount),
    tempCompletionRate,
    visitRecordedCount,
    visitPendingCount: Math.max(0, activePatients.length - visitRecordedCount),
    visitCompletionRate,
    readyForDoctorCount,
    eligibleForRecoveryCount,
    recommendedForDischargeCount,
    totalPatientsCount,
    totalDischarged,
    totalDeceased,
    cohortTotal,
    cohortType,
    mortalityRate: parseFloat(mortalityRate.toFixed(1)),
    survivalRate: parseFloat(survivalRate.toFixed(1)),
    exceedsMortalityBenchmark,
    mortalityBenchmark: 15.0,
    survivalBenchmark: 85.0,
  };
}
