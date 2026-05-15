const VALID_STATUSES = new Set(['pending', 'confirmed', 'completed', 'cancelled']);

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

const normalizeEmail = email => {
  if (!isNonEmptyString(email)) return '';
  return email.trim().toLowerCase();
};

const isEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));

const isIsoDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(`${value}T00:00:00`));

const isTime = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');

const toPositiveInt = value => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toNonNegativeNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const toStringArray = value => {
  if (Array.isArray(value)) return value.map(String).map(item => item.trim()).filter(Boolean);
  if (isNonEmptyString(value)) return value.split(',').map(item => item.trim()).filter(Boolean);
  return [];
};

module.exports = {
  VALID_STATUSES,
  isNonEmptyString,
  normalizeEmail,
  isEmail,
  isIsoDate,
  isTime,
  toPositiveInt,
  toNonNegativeNumber,
  toStringArray,
};
