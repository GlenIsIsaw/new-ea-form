// Family member data + validation
export const MAX_FAMILY = 3;

// Duplicates from the original list (GRAND-CHILD, GRAND-PARENT) are removed.
// The first five are the most common, so they stay on top.
export const RELATIONSHIPS = [
  "PARENTS",
  "CHILD",
  "SPOUSE",
  "UNCLE/AUNTY",
  "GRAND-CHILD",
  "GRAND-PARENT",
  "COMMON-LAW SPOUSE",
  "CONCERNED CITIZEN",
  "COUSIN",
  "CUSTODIAN",
  "DISTANT RELATIVES",
  "FIANCE",
  "GOD-CHILD",
  "GOD-FATHER/GOD-MOTHER",
  "GREAT GRAND-CHILD",
  "GREAT GRAND-PARENT",
  "GUARDIAN",
  "IN-LAWS",
  "NEIGHBOR",
  "NIECE/NEPHEW",
  "SIBLING",
];

const THIS_YEAR = new Date().getFullYear();
// Family members can be any age, so there is no 2014 limit here
export const FAMILY_YEARS = Array.from(
  { length: 101 },
  (_, i) => THIS_YEAR - i,
);

export const emptyMember = () => ({
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
});

const NAME_RE = /^[A-Za-zÀ-ÿñÑ]+(?:[ '’-][A-Za-zÀ-ÿñÑ]+)*$/;

export const hasOccupation = (v) =>
  !!v.trim() && !/^(none|n\/?a|na|nil|-+|not applicable)$/i.test(v.trim());

const memberValidators = {
  relationship: (v) => (v ? "" : "Please select the relationship."),
  lastName: (v) =>
    !v.trim()
      ? "Please enter the last name."
      : !NAME_RE.test(v.trim())
        ? "Use letters only (including ñ). No periods or numbers."
        : "",
  firstName: (v) =>
    !v.trim()
      ? "Please enter the first name."
      : !NAME_RE.test(v.trim())
        ? "Use letters only (including ñ). No periods or numbers."
        : "",
  middleName: (v) => {
    const t = v.trim();
    if (!t) return "";
    if (/^(n\/?a|none)$/i.test(t))
      return "Leave this blank if there is no middle name.";
    if (!NAME_RE.test(t))
      return "Write the full middle name. Do not use initials or periods.";
    if (t.split(/[ '’-]/).every((w) => w.length === 1))
      return "Write the full middle name, not an initial.";
    return "";
  },
  sex: (v) => (v ? "" : "Please select the gender."),
  civilStatus: (v) => (v ? "" : "Please select the civil status."),
  birthday: (_, m) => {
    if (!m.bMonth || !m.bDay || !m.bYear)
      return "Please select the complete birthday.";
    return new Date(m.bYear, m.bMonth - 1, m.bDay) > new Date()
      ? "Birthday cannot be in the future."
      : "";
  },
  contact: (v) =>
    !v || /^09\d{9}$/.test(v)
      ? ""
      : "Enter an 11-digit number starting with 09.", // optional
  salary: (v, m) =>
    !hasOccupation(m.occupation)
      ? ""
      : !v || Number(v) <= 0
        ? "Monthly salary is required when an occupation is entered."
        : "",
};

export const validateMemberField = (name, m) =>
  memberValidators[name]?.(m[name], m) ?? "";

export const validateMember = (m) => {
  const errs = {};
  Object.keys(memberValidators).forEach((k) => {
    const msg = validateMemberField(k, m);
    if (msg) errs[k] = msg;
  });
  return errs;
};
