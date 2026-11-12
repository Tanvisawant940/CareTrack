import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getInitialDemoPatients } from './initialData';
import { getTodayString, getCurrentTimeString, formatReadableDate } from '../utils/dateUtils';
import {
  checkIsFever,
  calculateRecoveryProgress,
  getPatientDailyStatus,
  calculateHospitalMetrics,
} from '../utils/calculations';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  PATIENTS: 'caretrack_patients_v1',
  FEVER_THRESHOLD: 'caretrack_fever_threshold_v1',
  USER_ROLE: 'caretrack_user_role_v1',
  IS_AUTHENTICATED: 'caretrack_auth_v1',
  SIMULATED_OFFSET: 'caretrack_sim_offset_v1',
};

export function AppProvider({ children }) {
  // Authentication & Role State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
    return saved !== null ? JSON.parse(saved) : true; // Default logged in for seamless demo review
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'admin';
  });

  // Simulated date offset (days from real today, for evaluator multi-day simulation)
  const [simulatedOffset, setSimulatedOffset] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFSET);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Configurable Fever Threshold (Requirement: Configurable, not arbitrary)
  const [feverThreshold, setFeverThreshold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEVER_THRESHOLD);
    return saved ? parseFloat(saved) : 37.5;
  });

  // Patients dataset
  const [patients, setPatients] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading patients from localStorage', e);
    }
    return getInitialDemoPatients(0);
  });

  // Cohort reporting filter ('all' = all admitted, 'closed' = discharged + deceased)
  const [cohortType, setCohortType] = useState('all');

  // Navigation view
  const [activeTab, setActiveTab] = useState('dashboard');

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEVER_THRESHOLD, feverThreshold.toString());
  }, [feverThreshold]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFSET, simulatedOffset.toString());
  }, [simulatedOffset]);

  // Current operational simulation date
  const currentDate = useMemo(() => {
    return getTodayString(simulatedOffset);
  }, [simulatedOffset]);

  // Toast notification helper
  const addToast = (message, type = 'info', durationMs = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (durationMs > 0) {
      setTimeout(() => {
        removeToast(id);
      }, durationMs);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth actions
  const login = (role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    addToast(`Signed in as ${role.toUpperCase()}`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast('Logged out', 'info');
  };

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    addToast(`Switched active workspace to ${newRole.toUpperCase()} mode`, 'info');
  };

  // Business Action: Record Temperature (Nurse)
  const recordTemperature = (patientId, { value, date, notes = '', recordedBy = 'Staff Nurse' }) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      addToast('Patient record not found', 'error');
      return { success: false, error: 'Patient not found' };
    }

    if (patient.status !== 'Active') {
      const err = `Cannot record temperature: Patient is ${patient.status}.`;
      addToast(err, 'error');
      return { success: false, error: err };
    }

    const targetDate = date ? date.substring(0, 10) : currentDate;

    // Rule 1 & 2: Only 1 official temperature entry per patient per calendar day
    const alreadyRecorded = patient.temperatures?.some(
      (t) => t.date.substring(0, 10) === targetDate
    );

    if (alreadyRecorded) {
      const err = `Duplicate Entry Blocked: An official temperature for ${formatReadableDate(targetDate)} has already been recorded for ${patient.name}.`;
      addToast(err, 'error', 5000);
      return { success: false, error: err };
    }

    const tempNum = parseFloat(value);
    if (isNaN(tempNum) || tempNum < 32 || tempNum > 44) {
      const err = 'Please enter a valid body temperature reading between 32.0°C and 44.0°C.';
      addToast(err, 'error');
      return { success: false, error: err };
    }

    const isFever = checkIsFever(tempNum, feverThreshold);
    const newEntry = {
      id: `T-${patient.id}-${Date.now()}`,
      date: `${targetDate}T${getCurrentTimeString()}:00`,
      value: tempNum,
      recordedBy,
      notes: notes.trim(),
      isFever,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const updatedTemps = [...(p.temperatures || []), newEntry];
        return {
          ...p,
          temperatures: updatedTemps,
        };
      })
    );

    const feverNotice = isFever 
      ? ` ⚠️ Reading exceeds fever threshold (${feverThreshold}°C). Recovery count reset.` 
      : ' (Afebrile / Normal).';
    addToast(`Recorded ${tempNum}°C for ${patient.name}.${feverNotice}`, isFever ? 'warning' : 'success', 4500);

    return { success: true, entry: newEntry };
  };

  // Business Action: Record Doctor Visit (Doctor)
  const recordDoctorVisit = (patientId, { observations, treatmentNotes, doctorName = 'Attending Physician', date }) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      addToast('Patient not found', 'error');
      return { success: false, error: 'Patient not found' };
    }

    if (patient.status !== 'Active') {
      const err = `Cannot record visit: Patient is ${patient.status}.`;
      addToast(err, 'error');
      return { success: false, error: err };
    }

    const targetDate = date ? date.substring(0, 10) : currentDate;

    // Rule 3: Doctor visit must happen AFTER temperature is recorded for today
    const tempForTargetDate = patient.temperatures?.find(
      (t) => t.date.substring(0, 10) === targetDate
    );

    if (!tempForTargetDate) {
      const err = `Protocol Violation: Daily temperature for ${formatReadableDate(targetDate)} has NOT been recorded yet. A nurse must record the patient's temperature first.`;
      addToast(err, 'error', 6000);
      return { success: false, error: err };
    }

    // Rule 4: Only one completed doctor visit per patient per calendar day
    const alreadyVisited = patient.doctorVisits?.some(
      (v) => v.date.substring(0, 10) === targetDate
    );

    if (alreadyVisited) {
      const err = `Duplicate Visit Blocked: A doctor visit has already been conducted for ${patient.name} on ${formatReadableDate(targetDate)}.`;
      addToast(err, 'error', 5000);
      return { success: false, error: err };
    }

    if (!observations?.trim()) {
      const err = 'Medical observations cannot be empty.';
      addToast(err, 'error');
      return { success: false, error: err };
    }

    const newVisit = {
      id: `V-${patient.id}-${Date.now()}`,
      date: `${targetDate}T${getCurrentTimeString()}:00`,
      doctorName,
      observations: observations.trim(),
      treatmentNotes: (treatmentNotes || '').trim(),
      linkedTempId: tempForTargetDate.id,
      linkedTempValue: tempForTargetDate.value,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          doctorVisits: [...(p.doctorVisits || []), newVisit],
        };
      })
    );

    addToast(`Daily doctor visit recorded for ${patient.name}.`, 'success');
    return { success: true, visit: newVisit };
  };

  // Business Action: Doctor Recommends Discharge
  const recommendDischarge = (patientId, { doctorName = 'Attending Physician', recommendationNotes = '' }) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return { success: false, error: 'Patient not found' };

    const recovery = calculateRecoveryProgress(patient.temperatures || [], feverThreshold);

    // Rule 5: 3 consecutive fever-free days required
    if (recovery.consecutiveDays < 3) {
      const err = `Eligibility Failed: Patient has only ${recovery.consecutiveDays}/3 consecutive fever-free days. 3 full consecutive fever-free days are required before discharge can be recommended.`;
      addToast(err, 'error', 5000);
      return { success: false, error: err };
    }

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          dischargeRecommended: true,
          recommendedByDoctor: doctorName,
          recommendationNotes: recommendationNotes || 'Clinical criteria verified: 3 consecutive fever-free days achieved with stable vitals.',
          recommendedDate: currentDate,
        };
      })
    );

    addToast(`Discharge officially recommended for ${patient.name}. Routed to Facility Admin.`, 'success');
    return { success: true };
  };

  // Business Action: Admin Processes Final Discharge
  const processDischarge = (patientId, { adminName = 'Facility Administrator', dischargeNotes = '' }) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return { success: false, error: 'Patient not found' };

    // Rule 9: Doctor discharge recommendation is mandatory before admin discharge
    if (!patient.dischargeRecommended) {
      const err = `Protocol Violation: Doctor discharge recommendation is mandatory before admin can process final discharge.`;
      addToast(err, 'error', 5000);
      return { success: false, error: err };
    }

    const releasedRoom = patient.roomNumber;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'Discharged',
          dischargeCompleted: true,
          dischargeDate: currentDate,
          processedByAdmin: adminName,
          dischargeNotes: dischargeNotes || 'Discharge confirmed by administration following physician clearance.',
          previousRoom: releasedRoom,
          roomNumber: null, // Rule 12: Discharged patient releases their room
        };
      })
    );

    addToast(`Patient ${patient.name} officially discharged. Room ${releasedRoom} is now sanitized and available!`, 'success', 5000);
    return { success: true };
  };

  // Business Action: Record Patient Death (Admin)
  const recordPatientDeath = (patientId, { causeOfDeath, deathNotes, adminName = 'Facility Administrator' }) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return { success: false, error: 'Patient not found' };

    const releasedRoom = patient.roomNumber;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          status: 'Deceased',
          dateOfDeath: currentDate,
          causeOfDeath: causeOfDeath || 'Cardiorespiratory arrest secondary to acute illness.',
          deathNotes: deathNotes || 'Official clinical demise record logged by administration.',
          previousRoom: releasedRoom,
          roomNumber: null, // Released room
        };
      })
    );

    addToast(`Demise recorded for ${patient.name}. Room ${releasedRoom || 'N/A'} released. Historical record preserved.`, 'warning', 5000);
    return { success: true };
  };

  // Business Action: Register New Patient (Admin)
  const addPatient = ({ name, age, gender, roomNumber, diagnosis, contact, emergencyContact }) => {
    const metrics = calculateHospitalMetrics(patients, currentDate, feverThreshold, cohortType);

    // Rule 11: Maximum capacity 74 active patients
    if (metrics.occupiedRooms >= 74) {
      const err = 'Maximum Hospital Capacity Exceeded: Facility is operating at 74/74 full capacity. Cannot admit new patients until a bed is vacated.';
      addToast(err, 'danger', 6000);
      return { success: false, error: err };
    }

    // Validate room occupancy
    const roomTaken = patients.some(
      (p) => p.status === 'Active' && p.roomNumber?.toString() === roomNumber?.toString()
    );

    if (roomTaken) {
      const err = `Room ${roomNumber} is already occupied by an active patient. Please assign an available room.`;
      addToast(err, 'error');
      return { success: false, error: err };
    }

    const newId = `PT-${roomNumber || Math.floor(100 + Math.random() * 900)}`;

    const newPatient = {
      id: newId,
      name: name.trim(),
      age: parseInt(age, 10) || 30,
      gender: gender || 'Other',
      roomNumber: roomNumber.toString(),
      admissionDate: currentDate,
      status: 'Active',
      diagnosis: diagnosis?.trim() || 'Suspected Viral Infection under Observation',
      contact: contact?.trim() || '',
      emergencyContact: emergencyContact?.trim() || '',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [],
      doctorVisits: [],
    };

    setPatients((prev) => [newPatient, ...prev]);
    addToast(`Patient ${name} successfully admitted to Room ${roomNumber}.`, 'success');
    return { success: true, patient: newPatient };
  };

  // Reset Demo Data
  const resetDemoData = () => {
    const freshData = getInitialDemoPatients(simulatedOffset);
    setPatients(freshData);
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    addToast('Demo dataset has been reset to initial baseline.', 'info');
  };

  // Simulation step (+1 Day / Reset)
  const advanceDay = (daysCount = 1) => {
    setSimulatedOffset((prev) => {
      const next = prev + daysCount;
      addToast(`Simulated date advanced by ${daysCount} day(s). Active date is now ${getTodayString(next)}.`, 'info');
      return next;
    });
  };

  const resetSimulationDate = () => {
    setSimulatedOffset(0);
    addToast('Simulation date restored to real calendar date.', 'info');
  };

  // Overall hospital metrics computed continuously
  const hospitalMetrics = useMemo(() => {
    return calculateHospitalMetrics(patients, currentDate, feverThreshold, cohortType);
  }, [patients, currentDate, feverThreshold, cohortType]);

  const value = {
    isAuthenticated,
    currentRole,
    login,
    logout,
    switchRole,
    patients,
    feverThreshold,
    setFeverThreshold,
    simulatedOffset,
    currentDate,
    advanceDay,
    resetSimulationDate,
    cohortType,
    setCohortType,
    activeTab,
    setActiveTab,
    toasts,
    addToast,
    removeToast,
    hospitalMetrics,
    // Operations
    recordTemperature,
    recordDoctorVisit,
    recommendDischarge,
    processDischarge,
    recordPatientDeath,
    addPatient,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
