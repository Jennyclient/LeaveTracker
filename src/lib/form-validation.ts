const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 15;
const PHONE_ALLOWED_REGEX = /^[+]?[\d\s()-]*$/;
const PASSWORD_MIN_LENGTH = 6;

const ACCOUNT_HOLDER_NAME_REGEX = /^[A-Za-z]+(?:[ '.-][A-Za-z]+)*$/;
const BANK_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9 &.'()-]*$/;
const BANK_ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;
const IFSC_CODE_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const BANK_BRANCH_REGEX = /^[A-Za-z0-9]+(?:[ ,.'-][A-Za-z0-9]+)*$/;
const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;
const PERSON_NAME_REGEX = /^[A-Za-z]+(?:[ '.-][A-Za-z]+)*$/;

export { PASSWORD_MIN_LENGTH };

export function sanitizePhoneInput(
  value: string,
  maxDigits: number = PHONE_MAX_DIGITS
): string {
  return value.replace(/\D/g, "").slice(0, maxDigits);
}

export function sanitizeDigitsInput(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}

export function sanitizeIfscInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 11);
}

export function sanitizeAlphaNameInput(value: string, maxLength = 100): string {
  return value.replace(/[^A-Za-z\s.'-]/g, "").slice(0, maxLength);
}

export function validateRequired(
  value: string,
  message: string
): string | null {
  return value.trim() ? null : message;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) {
    return "Please enter your email";
  }

  if (!EMAIL_REGEX.test(value.trim())) {
    return "Please enter a valid email address";
  }

  return null;
}

export function validatePhone(
  value: string,
  fieldName = "contact number"
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return `Please enter your ${fieldName}`;
  }

  if (!PHONE_ALLOWED_REGEX.test(trimmed)) {
    return `Please enter a valid ${fieldName}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!/^\d{10,15}$/.test(digits)) {
    return `Enter a valid phone number (${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digits)`;
  }

  return null;
}

export function validatePassword(
  value: string,
  options?: { required?: boolean; minLength?: number }
): string | null {
  const trimmed = value;
  const isRequired = options?.required !== false;
  const minLength = options?.minLength ?? PASSWORD_MIN_LENGTH;

  if (!trimmed.trim()) {
    return isRequired ? "Please enter your password" : null;
  }

  if (trimmed.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }

  return null;
}

export function validatePersonName(
  value: string,
  fieldName = "name"
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return `Please enter ${fieldName}`;
  }

  if (trimmed.length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }

  if (!PERSON_NAME_REGEX.test(trimmed)) {
    return `Enter a valid ${fieldName} using letters only`;
  }

  return null;
}

export function validateAccountHolderName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Account holder name is required";
  }

  if (trimmed.length < 2) {
    return "Account holder name must be at least 2 characters";
  }

  if (!ACCOUNT_HOLDER_NAME_REGEX.test(trimmed)) {
    return "Enter a valid account holder name using letters only";
  }

  return null;
}

export function validateBankName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Bank name is required";
  }

  if (trimmed.length < 2) {
    return "Bank name must be at least 2 characters";
  }

  if (!BANK_NAME_REGEX.test(trimmed)) {
    return "Enter a valid bank name";
  }

  return null;
}

export function validateBankAccountNumber(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Account number is required";
  }

  if (!BANK_ACCOUNT_NUMBER_REGEX.test(trimmed)) {
    return "Enter a valid account number (9-18 digits)";
  }

  return null;
}

export function validateIfscCode(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) {
    return "IFSC code is required";
  }

  if (!IFSC_CODE_REGEX.test(trimmed)) {
    return "Enter a valid IFSC code (e.g. SBIN0001234)";
  }

  return null;
}

export function validateBankBranch(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Branch is required";
  }

  if (trimmed.length < 2) {
    return "Branch must be at least 2 characters";
  }

  if (!BANK_BRANCH_REGEX.test(trimmed)) {
    return "Enter a valid branch name";
  }

  return null;
}

export function validateUpiId(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!UPI_ID_REGEX.test(trimmed)) {
    return "Enter a valid UPI ID (e.g. name@upi)";
  }

  return null;
}

export function validateConfirmBankAccountNumber(
  value: string,
  original: string
): string | null {
  if (!value.trim()) {
    return "Please confirm account number";
  }

  const formatError = validateBankAccountNumber(value);
  if (formatError) {
    return formatError;
  }

  if (value !== original) {
    return "Account numbers do not match";
  }

  return null;
}

export function validatePositiveNumber(
  value: string,
  fieldName: string,
  options?: { required?: boolean }
): string | null {
  const trimmed = value.trim();
  const isRequired = options?.required !== false;

  if (!trimmed) {
    return isRequired ? `${fieldName} is required` : null;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return `${fieldName} must be a valid number`;
  }

  return null;
}

export function validateDateRange(start: string, end: string): string | null {
  if (!start || !end) {
    return null;
  }

  if (new Date(start) > new Date(end)) {
    return "End date cannot be before start date";
  }

  return null;
}

export function validateSelect(
  value: string,
  message: string,
  invalidValues: string[] = []
): string | null {
  if (!value.trim() || invalidValues.includes(value)) {
    return message;
  }

  return null;
}

export function buildFieldErrors<T extends string>(
  validators: Array<{ field: T; error: string | null | undefined }>
): Partial<Record<T, string>> {
  const result: Partial<Record<T, string>> = {};

  for (const { field, error } of validators) {
    if (error) {
      result[field] = error;
    }
  }

  return result;
}

export function hasFieldErrors<T extends string>(
  errors: Partial<Record<T, string>>
): boolean {
  return Object.keys(errors).length > 0;
}

export function firstValidationError(
  ...errors: Array<string | null | undefined>
): string | null {
  return errors.find(Boolean) ?? null;
}

export function validateFormElement(form: HTMLFormElement): boolean {
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  return true;
}
