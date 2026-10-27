// Shared dropdown lists + helper, used by App.jsx, FamilyMemberCard.jsx and ReviewModal.jsx
export const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];
export const EXTENSIONS = ["JR.", "SR.", "II", "III", "IV", "V"];
export const SEX = ["MALE", "FEMALE"];
export const CIVIL = [
  "SINGLE",
  "MARRIED",
  "SEPARATED",
  "WIDOW/WIDOWER",
  "COMMON-LAW",
];

// number of days in a month (month is 1-12; year optional)
export const daysIn = (m, y) =>
  m ? new Date(y || 2024, Number(m), 0).getDate() : 31;
