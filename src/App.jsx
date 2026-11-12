import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Toast from './components/common/Toast';
import LoginScreen from './components/auth/LoginScreen';
import AdminDashboard from './components/dashboards/AdminDashboard';
import NurseDashboard from './components/dashboards/NurseDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import DischargeManagement from './components/dashboards/DischargeManagement';
import HospitalReports from './components/reports/HospitalReports';
import PatientList from './components/patients/PatientList';

// Modals
import RecordTemperatureModal from './components/patients/RecordTemperatureModal';
import RecordVisitModal from './components/patients/RecordVisitModal';
import RecommendDischargeModal from './components/patients/RecommendDischargeModal';
import ProcessDischargeModal from './components/patients/ProcessDischargeModal';
import RecordDeathModal from './components/patients/RecordDeathModal';
import AddPatientModal from './components/patients/AddPatientModal';
import PatientDetailsModal from './components/patients/PatientDetailsModal';
import FacilitySettingsModal from './components/settings/FacilitySettingsModal';

function CareTrackApp() {
  const { isAuthenticated, currentRole, activeTab, setActiveTab } = useApp();

  // Modal states
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [isRecordTempOpen, setIsRecordTempOpen] = useState(false);
  const [isRecordVisitOpen, setIsRecordVisitOpen] = useState(false);
  const [isRecommendDischargeOpen, setIsRecommendDischargeOpen] = useState(false);
  const [isProcessDischargeOpen, setIsProcessDischargeOpen] = useState(false);
  const [isRecordDeathOpen, setIsRecordDeathOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal triggers
  const handleOpenDetails = (id) => {
    setSelectedPatientId(id);
    setIsDetailsOpen(true);
  };

  const handleOpenRecordTemp = (id) => {
    setSelectedPatientId(id || null);
    setIsRecordTempOpen(true);
  };

  const handleOpenRecordVisit = (id) => {
    setSelectedPatientId(id || null);
    setIsRecordVisitOpen(true);
  };

  const handleOpenRecommendDischarge = (id) => {
    setSelectedPatientId(id);
    setIsRecommendDischargeOpen(true);
  };

  const handleOpenProcessDischarge = (id) => {
    setSelectedPatientId(id);
    setIsProcessDischargeOpen(true);
  };

  const handleOpenRecordDeath = (id) => {
    setSelectedPatientId(id);
    setIsRecordDeathOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <Toast />
      </>
    );
  }

  // Render content according to activeTab
  const renderScreen = () => {
    switch (activeTab) {
      case 'nurse-dashboard':
        return (
          <NurseDashboard
            initialFilter="all"
            onViewDetails={handleOpenDetails}
            onRecordTemp={handleOpenRecordTemp}
          />
        );
      case 'nurse-temps':
        return (
          <NurseDashboard
            initialFilter="pending-temp"
            onViewDetails={handleOpenDetails}
            onRecordTemp={handleOpenRecordTemp}
          />
        );
      case 'doctor-dashboard':
        return (
          <DoctorDashboard
            initialFilter="all"
            onViewDetails={handleOpenDetails}
            onRecordVisit={handleOpenRecordVisit}
            onRecommendDischarge={handleOpenRecommendDischarge}
          />
        );
      case 'doctor-ready':
        return (
          <DoctorDashboard
            initialFilter="ready-doctor"
            onViewDetails={handleOpenDetails}
            onRecordVisit={handleOpenRecordVisit}
            onRecommendDischarge={handleOpenRecommendDischarge}
          />
        );
      case 'doctor-reviews':
        return (
          <DoctorDashboard
            initialFilter="recovery-eligible"
            onViewDetails={handleOpenDetails}
            onRecordVisit={handleOpenRecordVisit}
            onRecommendDischarge={handleOpenRecommendDischarge}
          />
        );
      case 'patients':
        return (
          <PatientList
            title="Quarantine Facility Patient Directory"
            subtitle="Complete census of all active, discharged, and historical patient records"
            filterPreset="all"
            onViewDetails={handleOpenDetails}
            onRecordTemp={handleOpenRecordTemp}
            onRecordVisit={handleOpenRecordVisit}
            onRecommendDischarge={handleOpenRecommendDischarge}
            onProcessDischarge={handleOpenProcessDischarge}
            onAddNewPatient={() => setIsAddPatientOpen(true)}
          />
        );
      case 'discharge-queue':
        return (
          <DischargeManagement
            onViewDetails={handleOpenDetails}
            onProcessDischarge={handleOpenProcessDischarge}
          />
        );
      case 'reports':
        return <HospitalReports />;
      default: // 'admin-dashboard'
        return (
          <AdminDashboard
            onViewDetails={handleOpenDetails}
            onRecordTemp={handleOpenRecordTemp}
            onRecordVisit={handleOpenRecordVisit}
            onRecommendDischarge={handleOpenRecommendDischarge}
            onProcessDischarge={handleOpenProcessDischarge}
            onAddNewPatient={() => setIsAddPatientOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Main Content Area */}
      <div className="main-content">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />

        <main className="page-body">
          {renderScreen()}
        </main>
      </div>

      {/* Modals */}
      <RecordTemperatureModal
        isOpen={isRecordTempOpen}
        onClose={() => setIsRecordTempOpen(false)}
        preselectedPatientId={selectedPatientId}
      />

      <RecordVisitModal
        isOpen={isRecordVisitOpen}
        onClose={() => setIsRecordVisitOpen(false)}
        preselectedPatientId={selectedPatientId}
        onOpenRecommendDischarge={handleOpenRecommendDischarge}
      />

      <RecommendDischargeModal
        isOpen={isRecommendDischargeOpen}
        onClose={() => setIsRecommendDischargeOpen(false)}
        patientId={selectedPatientId}
      />

      <ProcessDischargeModal
        isOpen={isProcessDischargeOpen}
        onClose={() => setIsProcessDischargeOpen(false)}
        patientId={selectedPatientId}
      />

      <RecordDeathModal
        isOpen={isRecordDeathOpen}
        onClose={() => setIsRecordDeathOpen(false)}
        patientId={selectedPatientId}
      />

      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
      />

      <PatientDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        patientId={selectedPatientId}
        onRecordTemp={handleOpenRecordTemp}
        onRecordVisit={handleOpenRecordVisit}
        onRecommendDischarge={handleOpenRecommendDischarge}
        onProcessDischarge={handleOpenProcessDischarge}
        onRecordDeath={handleOpenRecordDeath}
      />

      <FacilitySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CareTrackApp />
    </AppProvider>
  );
}
