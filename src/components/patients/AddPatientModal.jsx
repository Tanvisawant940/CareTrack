import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { UserPlus, AlertCircle, BedDouble, X } from 'lucide-react';

export default function AddPatientModal({ isOpen, onClose }) {
  const { patients, addPatient, hospitalMetrics } = useApp();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [roomNumber, setRoomNumber] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [contact, setContact] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [error, setError] = useState('');

  // Find currently occupied rooms
  const occupiedRoomSet = new Set(
    patients
      .filter((p) => p.status === 'Active' && p.roomNumber)
      .map((p) => p.roomNumber.toString())
  );

  // Generate list of available rooms (from 101 to 174)
  const availableRooms = [];
  for (let i = 101; i <= 174; i++) {
    const roomStr = i.toString();
    if (!occupiedRoomSet.has(roomStr)) {
      availableRooms.push(roomStr);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setName('');
      setAge('');
      setGender('Male');
      setDiagnosis('Suspected Exposure Quarantine - Observation');
      setContact('');
      setEmergencyContact('');
      setError('');
      // Auto-assign the first vacant room
      if (availableRooms.length > 0) {
        setRoomNumber(availableRooms[0]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFullCapacity = hospitalMetrics.occupiedRooms >= 74;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isFullCapacity) {
      setError('Hospital capacity reached: Maximum 74 active patients allowed.');
      return;
    }

    if (!name.trim()) {
      setError('Patient name is required.');
      return;
    }

    if (!roomNumber) {
      setError('Please select an available room.');
      return;
    }

    const result = addPatient({
      name,
      age: parseInt(age, 10) || 30,
      gender,
      roomNumber,
      diagnosis,
      contact,
      emergencyContact,
    });

    if (result.success) {
      onClose();
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={18} />
            </div>
            <span>Admit New Patient to Quarantine</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-banner alert-danger" style={{ marginBottom: '16px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>{error}</div>
              </div>
            )}

            {/* Capacity status banner */}
            <div
              style={{
                backgroundColor: isFullCapacity ? '#fef2f2' : '#f0fdf4',
                border: `1px solid ${isFullCapacity ? '#fecaca' : '#bbf7d0'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BedDouble size={18} style={{ color: isFullCapacity ? '#dc2626' : '#059669' }} />
                <div>
                  <span style={{ fontSize: '0.84rem', color: isFullCapacity ? '#991b1b' : '#166534', fontWeight: 600 }}>
                    Hospital Capacity: {hospitalMetrics.occupiedRooms} / {hospitalMetrics.maxCapacity} Occupied
                  </span>
                  <div style={{ fontSize: '0.74rem', color: isFullCapacity ? '#b91c1c' : '#15803d' }}>
                    {hospitalMetrics.availableRooms} rooms available out of 74 max slots.
                  </div>
                </div>
              </div>
              <span
                className={`status-pill ${isFullCapacity ? 'status-fever' : 'status-active'}`}
              >
                {isFullCapacity ? 'Capacity Full' : 'Rooms Available'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Samuel Green"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Age */}
              <div className="form-group">
                <label className="form-label">Age <span className="required">*</span></label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="form-input"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Room Allocation */}
              <div className="form-group">
                <label className="form-label">
                  Assigned Room (Capacity: 101 - 174) <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  required
                  disabled={availableRooms.length === 0}
                >
                  {availableRooms.map((room) => (
                    <option key={room} value={room}>
                      Room {room} (Vacant)
                    </option>
                  ))}
                </select>
                <div className="form-help">
                  Only unoccupied rooms out of the 74 beds are listed.
                </div>
              </div>

              {/* Diagnosis / Quarantine Reason */}
              <div className="form-group">
                <label className="form-label">Quarantine Reason / Diagnosis</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. COVID-19 Mild Exposure"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Patient Phone</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>

              {/* Emergency Contact */}
              <div className="form-group">
                <label className="form-label">Emergency Contact Details</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Name (Relation) - Phone"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isFullCapacity || availableRooms.length === 0}
            >
              Admit & Allocate Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
