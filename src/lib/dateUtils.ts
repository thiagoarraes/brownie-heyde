/**
 * Utility functions for date formatting in Brazilian format (DD/MM/YYYY)
 */

/**
 * Formats a date to Brazilian format DD/MM/YYYY
 */
export const formatDateBR = (date: string | Date): string => {
  // Se for string no formato YYYY-MM-DD, use conversão direta para evitar problemas de fuso horário
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return convertInputDateToBRFormat(date);
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Formats a date to Brazilian format with time DD/MM/YYYY HH:mm
 */
export const formatDateTimeBR = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
};

/**
 * Gets today's date in YYYY-MM-DD format for HTML date inputs
 * Uses local timezone to avoid date shifting issues
 */
export const getTodayInputFormat = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Converts a date from DD/MM/YYYY to YYYY-MM-DD for HTML inputs
 */
export const convertBRDateToInputFormat = (brDate: string): string => {
  const [day, month, year] = brDate.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Converts a date from YYYY-MM-DD to DD/MM/YYYY for display
 */
export const convertInputDateToBRFormat = (inputDate: string): string => {
  const [year, month, day] = inputDate.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Ensures date is in YYYY-MM-DD format without timezone conversion
 * This prevents the date from shifting when saved to database
 */
export const ensureDateFormat = (date: string): string => {
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // If it's in DD/MM/YYYY format, convert to YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    return convertBRDateToInputFormat(date);
  }
  
  // For any other format, try to parse and format correctly
  const dateObj = new Date(date);
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return date; // Return original if can't parse
};
