// Extra data for the "Authorization / Minor Age / Senior High School" category.
// Your existing data/school.js stays as it is (college schools, OUTSIDE_CN).
import { OUTSIDE_CN } from "./school";

export const OTHERS_SCHOOL = "OTHERS (NOT IN THE LIST)";
// Either "other" option opens the box where the student types the school's name
export const isOtherSchool = (v) => v === OUTSIDE_CN || v === OTHERS_SCHOOL;

export const YEAR_LEVELS_AUTH = [
  "GRADE 11",
  "GRADE 12",
  "1ST YEAR",
  "2ND YEAR",
  "3RD YEAR",
  "4TH YEAR",
  "5TH YEAR",
];

// Senior high schools in Camarines Norte. This is a PARTIAL list compiled from DepEd's senior high school list,
// DepEd's school inventory and the DepEd voucher-program lists. Add or rename schools as needed.
// Schools that are also colleges (La Consolacion, Mabini, Our Lady of Peñafrancia, Camarines Norte College,
// University of Camarines Norte) are already in the college list that follows these.
export const SHS_GROUPS = [
  {
    label: "SENIOR HIGH SCHOOLS - PUBLIC",
    options: [
      "BASUD NATIONAL HIGH SCHOOL",
      "CAMARINES NORTE NATIONAL HIGH SCHOOL",
      "MATANGO NATIONAL HIGH SCHOOL",
      "MERCEDES HIGH SCHOOL",
      "SAN ROQUE NATIONAL HIGH SCHOOL",
      "VINZONS PILOT HIGH SCHOOL",
    ],
  },
  {
    label: "SENIOR HIGH SCHOOLS - PRIVATE",
    options: [
      "MABINI COLLEGES, INC.",
      "OUR LADY OF LOURDES COLLEGE FOUNDATION, INC.",
      "LA CONSOLACION COLLEGE OF DAET",
      "ST. FRANCIS CARACCIOLO CULINARY ACADEMY",
      "ST. JOHN THE APOSTLE ACADEMY",
    ],
  },
];
