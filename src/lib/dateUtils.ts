/**
 * Utility functions for date formatting in Brazilian format (DD/MM/YYYY)
 */

/**
 * Formats a date to Brazilian format DD/MM/YYYY
 */
export const formatDateBR = (date: string | Date): string => {
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
 */
export const getTodayInputFormat = (): string => {
  return new Date().toISOString().split('T')[0];
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