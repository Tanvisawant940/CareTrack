/**
 * Realistic Initial Demo Dataset for CareTrack
 * Anchored dynamically around the current simulation date.
 */

import { getDaysAgoDate, getTodayString } from '../utils/dateUtils';

export function getInitialDemoPatients(simulatedOffsetDays = 0) {
  const d0 = getTodayString(simulatedOffsetDays); // Today
  const d1 = getDaysAgoDate(1, simulatedOffsetDays); // Yesterday
  const d2 = getDaysAgoDate(2, simulatedOffsetDays); // 2 days ago
  const d3 = getDaysAgoDate(3, simulatedOffsetDays); // 3 days ago
  const d4 = getDaysAgoDate(4, simulatedOffsetDays); // 4 days ago
  const d7 = getDaysAgoDate(7, simulatedOffsetDays); // 7 days ago

  return [
    {
      id: 'PT-101',
      name: 'Sarah Jenkins',
      age: 34,
      gender: 'Female',
      roomNumber: '101',
      admissionDate: d3,
      status: 'Active',
      diagnosis: 'COVID-19 Quarantine - Mild Symptoms',
      contact: '+1 (555) 234-5678',
      emergencyContact: 'Mark Jenkins (Husband) - +1 (555) 234-9988',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-101-1', date: `${d2}T08:30:00`, value: 37.1, recordedBy: 'Nurse Clara Vance', notes: 'Patient reports mild headache' },
        { id: 'T-101-2', date: `${d1}T08:15:00`, value: 36.8, recordedBy: 'Nurse Clara Vance', notes: 'Afebrile, headache resolved' },
        // Temperature pending today!
      ],
      doctorVisits: [
        { id: 'V-101-1', date: `${d2}T11:00:00`, doctorName: 'Dr. Marcus Wells', observations: 'Vitals stable. Lungs clear bilaterally.', treatmentNotes: 'Continue hydration and multivitamin regimen.' },
        { id: 'V-101-2', date: `${d1}T10:30:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Patient alert, resting comfortably. Normal respiration.', treatmentNotes: 'Maintain quarantine protocol.' },
      ],
    },
    {
      id: 'PT-102',
      name: 'David Kim',
      age: 45,
      gender: 'Male',
      roomNumber: '102',
      admissionDate: d4,
      status: 'Active',
      diagnosis: 'Viral Pneumonia Post-Exposure',
      contact: '+1 (555) 345-6789',
      emergencyContact: 'Grace Kim (Sister) - +1 (555) 345-0011',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-102-1', date: `${d2}T09:00:00`, value: 37.8, recordedBy: 'Nurse James Miller', notes: 'Low fever, chills noted' },
        { id: 'T-102-2', date: `${d1}T08:45:00`, value: 36.9, recordedBy: 'Nurse Clara Vance', notes: 'Afebrile, resting well' },
        { id: 'T-102-3', date: `${d0}T08:10:00`, value: 36.7, recordedBy: 'Nurse Clara Vance', notes: 'Normal body temperature recorded' },
      ],
      doctorVisits: [
        { id: 'V-102-1', date: `${d2}T11:45:00`, doctorName: 'Dr. Marcus Wells', observations: 'Mild wheezing on right base.', treatmentNotes: 'Prescribed Paracetamol 500mg, increased fluid intake.' },
        { id: 'V-102-2', date: `${d1}T11:15:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Wheezing decreased, breathing relaxed.', treatmentNotes: 'Continue current monitoring.' },
        // Today's temperature is recorded, waiting for Doctor Visit!
      ],
    },
    {
      id: 'PT-103',
      name: 'Elena Rostova',
      age: 29,
      gender: 'Female',
      roomNumber: '103',
      admissionDate: d3,
      status: 'Active',
      diagnosis: 'Influenza Type A Quarantine',
      contact: '+1 (555) 456-7890',
      emergencyContact: 'Ivan Rostov (Father) - +1 (555) 456-2233',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-103-1', date: `${d2}T08:40:00`, value: 37.0, recordedBy: 'Nurse Clara Vance', notes: 'Mild fatigue' },
        { id: 'T-103-2', date: `${d1}T08:20:00`, value: 36.6, recordedBy: 'Nurse James Miller', notes: 'Vitals optimal' },
        { id: 'T-103-3', date: `${d0}T08:00:00`, value: 36.5, recordedBy: 'Nurse Clara Vance', notes: 'Vitals optimal, energetic' },
      ],
      doctorVisits: [
        { id: 'V-103-1', date: `${d2}T10:15:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Patient ambulatory, healthy appetite.', treatmentNotes: 'Supportive care.' },
        { id: 'V-103-2', date: `${d1}T09:45:00`, doctorName: 'Dr. Marcus Wells', observations: 'Asymptomatic today. Blood pressure 118/76.', treatmentNotes: 'Regular diet, bed rest.' },
        { id: 'V-103-3', date: `${d0}T09:30:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Fully asymptomatic, lungs clear, excellent energy levels.', treatmentNotes: 'Approaching complete recovery. Maintain observation.' },
        // Both temp and doctor visit completed today!
      ],
    },
    {
      id: 'PT-104',
      name: 'Robert Taylor',
      age: 52,
      gender: 'Male',
      roomNumber: '104',
      admissionDate: d4,
      status: 'Active',
      diagnosis: 'Suspected Exposure - Primary Contact',
      contact: '+1 (555) 567-8901',
      emergencyContact: 'Linda Taylor (Wife) - +1 (555) 567-4455',
      dischargeRecommended: true, // Recommended by Doctor!
      recommendationNotes: 'Patient has been completely fever-free for 3 consecutive days with no symptoms. Blood oxygen 99%, vital signs normal. Clinical recommendation for discharge approved.',
      recommendedByDoctor: 'Dr. Marcus Wells',
      recommendedDate: d0,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-104-1', date: `${d3}T08:15:00`, value: 37.2, recordedBy: 'Nurse Clara Vance', notes: 'Day 1 normal' },
        { id: 'T-104-2', date: `${d2}T08:05:00`, value: 36.6, recordedBy: 'Nurse James Miller', notes: 'Day 2 normal' },
        { id: 'T-104-3', date: `${d1}T08:10:00`, value: 36.5, recordedBy: 'Nurse Clara Vance', notes: 'Day 3 normal' },
        { id: 'T-104-4', date: `${d0}T07:50:00`, value: 36.6, recordedBy: 'Nurse Clara Vance', notes: 'Day 4 afebrile, ready for discharge review' },
      ],
      doctorVisits: [
        { id: 'V-104-1', date: `${d3}T10:00:00`, doctorName: 'Dr. Marcus Wells', observations: 'Patient stable.', treatmentNotes: 'Monitoring.' },
        { id: 'V-104-2', date: `${d2}T10:15:00`, doctorName: 'Dr. Evelyn Reed', observations: 'No symptoms reported.', treatmentNotes: 'Routine care.' },
        { id: 'V-104-3', date: `${d1}T10:00:00`, doctorName: 'Dr. Marcus Wells', observations: 'Continuous normal vitals.', treatmentNotes: 'Recovery tracking.' },
        { id: 'V-104-4', date: `${d0}T09:15:00`, doctorName: 'Dr. Marcus Wells', observations: 'Satisfied 3 consecutive fever-free criteria. Excellent condition.', treatmentNotes: 'Recommended for discharge review by Facility Admin.' },
      ],
    },
    {
      id: 'PT-105',
      name: 'Maria Santos',
      age: 38,
      gender: 'Female',
      roomNumber: '105',
      admissionDate: d4,
      status: 'Active',
      diagnosis: 'Bacterial Bronchitis under Quarantine',
      contact: '+1 (555) 678-9012',
      emergencyContact: 'Pedro Santos (Brother) - +1 (555) 678-7788',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-105-1', date: `${d2}T08:20:00`, value: 36.7, recordedBy: 'Nurse Clara Vance', notes: 'Day 1 fever-free' },
        { id: 'T-105-2', date: `${d1}T08:30:00`, value: 36.5, recordedBy: 'Nurse James Miller', notes: 'Day 2 fever-free' },
        { id: 'T-105-3', date: `${d0}T08:15:00`, value: 36.6, recordedBy: 'Nurse Clara Vance', notes: 'Day 3 fever-free - eligible for Doctor discharge recommendation!' },
      ],
      doctorVisits: [
        { id: 'V-105-1', date: `${d2}T11:10:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Cough greatly diminished.', treatmentNotes: 'Completed antibiotic round.' },
        { id: 'V-105-2', date: `${d1}T10:45:00`, doctorName: 'Dr. Marcus Wells', observations: 'Lungs clear, energy returning.', treatmentNotes: 'Continue observation.' },
        // Today has 3/3 fever-free days recorded! Awaiting Doctor to conduct visit and click "Recommend Discharge"!
      ],
    },
    {
      id: 'PT-106',
      name: 'James Wilson',
      age: 61,
      gender: 'Male',
      roomNumber: '106',
      admissionDate: d4,
      status: 'Active',
      diagnosis: 'Viral Infection - Recurrent Pyrexia',
      contact: '+1 (555) 789-0123',
      emergencyContact: 'Margaret Wilson (Daughter) - +1 (555) 789-6644',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-106-1', date: `${d3}T08:00:00`, value: 36.8, recordedBy: 'Nurse Clara Vance', notes: 'Normal temperature' },
        { id: 'T-106-2', date: `${d2}T08:10:00`, value: 36.7, recordedBy: 'Nurse Clara Vance', notes: 'Normal temperature (streak = 2)' },
        { id: 'T-106-3', date: `${d1}T08:35:00`, value: 38.6, recordedBy: 'Nurse James Miller', notes: 'High fever spike! Recovery count reset to 0.' },
        { id: 'T-106-4', date: `${d0}T08:25:00`, value: 37.9, recordedBy: 'Nurse Clara Vance', notes: 'Ongoing persistent fever' },
      ],
      doctorVisits: [
        { id: 'V-106-1', date: `${d3}T09:30:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Stable.', treatmentNotes: 'Routine care.' },
        { id: 'V-106-2', date: `${d2}T09:45:00`, doctorName: 'Dr. Marcus Wells', observations: 'No distress.', treatmentNotes: 'Monitoring.' },
        { id: 'V-106-3', date: `${d1}T10:15:00`, doctorName: 'Dr. Marcus Wells', observations: 'Acute fever recurrence. Heart rate 96 bpm.', treatmentNotes: 'Administered IV antipyretic, ordered urgent blood labs.' },
        // Temp recorded today with fever. Doctor visit pending today!
      ],
    },
    {
      id: 'PT-107',
      name: 'Ananya Sharma',
      age: 41,
      gender: 'Female',
      roomNumber: '107',
      admissionDate: d1,
      status: 'Active',
      diagnosis: 'Acute Respiratory Syndrome Quarantine',
      contact: '+1 (555) 890-1234',
      emergencyContact: 'Rajesh Sharma (Husband) - +1 (555) 890-5522',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-107-1', date: `${d1}T09:15:00`, value: 38.2, recordedBy: 'Nurse James Miller', notes: 'Admitted with fever' },
        { id: 'T-107-2', date: `${d0}T08:40:00`, value: 38.8, recordedBy: 'Nurse Clara Vance', notes: 'Severe fever spike, shivering reported' },
      ],
      doctorVisits: [
        { id: 'V-107-1', date: `${d1}T11:30:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Moderate tachypnea, oxygen saturation 94%.', treatmentNotes: 'Supplied supplemental nasal cannula oxygen 2L/min.' },
        // Awaiting doctor visit today!
      ],
    },
    {
      id: 'PT-108',
      name: 'Michael Chang',
      age: 58,
      gender: 'Male',
      roomNumber: '108',
      admissionDate: d2,
      status: 'Active',
      diagnosis: 'Severe Acute Bronchitis Post-Travel',
      contact: '+1 (555) 901-2345',
      emergencyContact: 'Emily Chang (Daughter) - +1 (555) 901-3311',
      dischargeRecommended: false,
      dischargeCompleted: false,
      temperatures: [
        { id: 'T-108-1', date: `${d2}T09:30:00`, value: 37.6, recordedBy: 'Nurse Clara Vance', notes: 'Low fever on admission' },
        { id: 'T-108-2', date: `${d1}T09:00:00`, value: 37.1, recordedBy: 'Nurse James Miller', notes: 'Normal temperature' },
        // Temperature pending today!
      ],
      doctorVisits: [
        { id: 'V-108-1', date: `${d2}T12:00:00`, doctorName: 'Dr. Marcus Wells', observations: 'Expiratory wheezes present.', treatmentNotes: 'Bronchodilator inhaler prescribed.' },
        { id: 'V-108-2', date: `${d1}T11:40:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Breathing eased.', treatmentNotes: 'Continue inhaler twice daily.' },
      ],
    },
    {
      id: 'PT-109',
      name: 'Arthur Pendelton',
      age: 70,
      gender: 'Male',
      roomNumber: null, // Released room upon discharge!
      previousRoom: '109',
      admissionDate: d7,
      dischargeDate: d1,
      status: 'Discharged',
      diagnosis: 'Recovered - Complete 3-day afebrile course',
      contact: '+1 (555) 123-4567',
      emergencyContact: 'Clara Pendelton (Wife) - +1 (555) 123-9900',
      dischargeRecommended: true,
      dischargeCompleted: true,
      dischargeNotes: 'Admin verified Dr. Evelyn Reed recommendation. 3 consecutive fever-free days verified. Room 109 sanitized and released.',
      temperatures: [
        { id: 'T-109-1', date: `${d4}T08:00:00`, value: 36.6, recordedBy: 'Nurse Clara Vance', notes: 'Afebrile' },
        { id: 'T-109-2', date: `${d3}T08:00:00`, value: 36.5, recordedBy: 'Nurse Clara Vance', notes: 'Afebrile' },
        { id: 'T-109-3', date: `${d2}T08:00:00`, value: 36.6, recordedBy: 'Nurse James Miller', notes: 'Afebrile' },
      ],
      doctorVisits: [
        { id: 'V-109-1', date: `${d2}T10:00:00`, doctorName: 'Dr. Evelyn Reed', observations: 'Complete resolution of illness.', treatmentNotes: 'Discharge recommended.' },
      ],
    },
    {
      id: 'PT-110',
      name: 'Harold Vance',
      age: 78,
      gender: 'Male',
      roomNumber: null, // Released room upon death
      previousRoom: '110',
      admissionDate: d7,
      dateOfDeath: d2,
      status: 'Deceased',
      diagnosis: 'Severe Acute Respiratory Failure & Cardiac Arrest',
      contact: '+1 (555) 234-7711',
      emergencyContact: 'Thomas Vance (Son) - +1 (555) 234-8822',
      dischargeRecommended: false,
      dischargeCompleted: false,
      causeOfDeath: 'Acute cardiorespiratory collapse refractory to resuscitation in intensive quarantine.',
      deathNotes: 'Official hospital death record logged by Admin following clinical declaration by Dr. Marcus Wells.',
      temperatures: [
        { id: 'T-110-1', date: `${d4}T08:00:00`, value: 39.1, recordedBy: 'Nurse Clara Vance', notes: 'Critically high fever' },
        { id: 'T-110-2', date: `${d3}T08:00:00`, value: 39.4, recordedBy: 'Nurse James Miller', notes: 'Unresponsive to antipyretics' },
      ],
      doctorVisits: [
        { id: 'V-110-1', date: `${d4}T10:00:00`, doctorName: 'Dr. Marcus Wells', observations: 'Severe respiratory distress, cyanosis.', treatmentNotes: 'Maximal oxygenation and hemodynamic support.' },
        { id: 'V-110-2', date: `${d3}T10:00:00`, doctorName: 'Dr. Marcus Wells', observations: 'Cardiopulmonary decompensation.', treatmentNotes: 'Emergency palliative and critical intervention.' },
      ],
    },
  ];
}
