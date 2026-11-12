/**
 * Date and time utilities for CareTrack
 */

export function getTodayString(simulatedOffsetDays = 0) {
  const d = new Date();
  if (simulatedOffsetDays !== 0) {
    d.setDate(d.getDate() + simulatedOffsetDays);
  }
  return formatDateToISO(d);
}

export function formatDateToISO(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(isoString) {
  if (!isoString) return '—';
  try {
    const parts = isoString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const d = new Date(isoString);
    return isNaN(d.getTime()) ? isoString : d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function getCurrentTimeString() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(date1Str, date2Str) {
  if (!date1Str || !date2Str) return false;
  return date1Str.substring(0, 10) === date2Str.substring(0, 10);
}

export function getDaysAgoDate(daysAgo, simulatedOffsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + simulatedOffsetDays - daysAgo);
  return formatDateToISO(d);
}
