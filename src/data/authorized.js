// The authorized person (only used by the "Authorization / Minor Age / Senior High School" category)
import { hasOccupation, RELATIONSHIPS } from "./family";
export { RELATIONSHIPS };

const THIS_YEAR = new Date().getFullYear();
export const AUTH_MIN_AGE = 18;
// Years offered: this year minus 18, going back 90 years
export const AUTH_YEARS = Array.from(
  { length: 91 },
  (_, i) => THIS_YEAR - AUTH_MIN_AGE - i,
);

export const emptyAuthorized = () => ({
  relationship: "",
  lastName: "",
  firstName: "",
  middleName: "",
  extension: "",
  sex: "",
  civilStatus: "",
  bMonth: "",
  bDay: "",
  bYear: "",
  contact: "",
  occupation: "",
  salary: "",
  philsys: "",
  municipality: "",
  barangay: "",
  street: "",
});

const NAME_RE = /^[A-Za-zÀ-ÿñÑ]+(?:[ '’-][A-Za-zÀ-ÿñÑ]+)*$/;

// true when the person is at least 18 years old today
const isAdult = (m, d, y) => {
  const t = new Date();
  const cutoff = new Date(
    t.getFullYear() - AUTH_MIN_AGE,
    t.getMonth(),
    t.getDate(),
  );
  return new Date(y, m - 1, d) <= cutoff;
};

const validators = {
  relationship: (v) =>
    v ? "" : "Please select your relationship to the beneficiary.",
  lastName: (v) =>
    !v.trim()
      ? "Please enter your last name."
      : !NAME_RE.test(v.trim())
        ? "Use letters only (including ñ). No periods or numbers."
        : "",
  firstName: (v) =>
    !v.trim()
      ? "Please enter your first name."
      : !NAME_RE.test(v.trim())
        ? "Use letters only (including ñ). No periods or numbers."
        : "",
  middleName: (v) => {
    const t = v.trim();
    if (!t) return "";
    if (/^(n\/?a|none)$/i.test(t))
      return "Leave this blank if you have no middle name.";
    if (!NAME_RE.test(t))
      return "Write your full middle name. Do not use initials or periods.";
    if (t.split(/[ '’-]/).every((w) => w.length === 1))
      return "Write your full middle name, not an initial.";
    return "";
  },
  sex: (v) => (v ? "" : "Please select your gender."),
  civilStatus: (v) => (v ? "" : "Please select your civil status."),
  birthday: (_, a) => {
    if (!a.bMonth || !a.bDay || !a.bYear)
      return "Please select your complete birthday.";
    return isAdult(a.bMonth, a.bDay, a.bYear)
      ? ""
      : `The authorized person must be at least ${AUTH_MIN_AGE} years old.`;
  },
  contact: (v) =>
    !v
      ? "Please enter your contact number."
      : !/^09\d{9}$/.test(v)
        ? "Enter an 11-digit number starting with 09."
        : "",
  philsys: (v) =>
    !v
      ? "Please enter your PhilSys ID number."
      : v.length !== 16
        ? "PhilSys ID number must be exactly 16 digits."
        : "",
  salary: (v, a) =>
    !hasOccupation(a.occupation)
      ? ""
      : !v || Number(v) <= 0
        ? "Monthly salary is required when you enter an occupation."
        : "",
  municipality: (v) => (v ? "" : "Please select your municipality."),
  barangay: (v) => (v ? "" : "Please select your barangay."),
};

export const validateAuthorizedField = (name, a) =>
  validators[name]?.(a[name], a) ?? "";

export const validateAuthorized = (a) => {
  const errs = {};
  Object.keys(validators).forEach((k) => {
    const msg = validateAuthorizedField(k, a);
    if (msg) errs[k] = msg;
  });
  return errs;
};
