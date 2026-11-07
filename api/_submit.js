const SB = process.env.SUPABASE_URL;
const SBK = process.env.SUPABASE_SERVICE_KEY;
const TS = process.env.TURNSTILE_SECRET;

const MONTHS = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
const REL = ["CHILD","SPOUSE","UNCLE/AUNTY","GRAND-CHILD","GRAND-PARENT","COMMON-LAW SPOUSE","CONCERNED CITIZEN","COUSIN","CUSTODIAN","DISTANT RELATIVES","FIANCE","GOD-CHILD","GOD-FATHER/GOD-MOTHER","GREAT GRAND-CHILD","GREAT GRAND-PARENT","GUARDIAN","IN-LAWS","NEIGHBOR","NIECE/NEPHEW","PARENTS","SIBLING"];
const SEX = ["MALE","FEMALE"];
const CIVIL = ["SINGLE","MARRIED","SEPARATED","WIDOW/WIDOWER","COMMON-LAW"];
const EXT = ["JR.","SR.","II","III","IV","V"];
const COLLEGE_YL = ["1ST YEAR","2ND YEAR","3RD YEAR","4TH YEAR","5TH YEAR"];
const YL = { COLLEGE: COLLEGE_YL, AUTHORIZATION: ["GRADE 11","GRADE 12"].concat(COLLEGE_YL) };
const CATS = ["COLLEGE", "AUTHORIZATION"];
const NAME_RE = /^(?=.{1,50}$)[A-Za-zÀ-ÿñÑ]+(?:[ '’-][A-Za-zÀ-ÿñÑ]+)*$/;
const SCHOOL_RE = /^[A-Za-zÀ-ÿñÑ0-9 .,'’&()\/-]{3,150}$/;
const EMAIL_RE = /^(?=.{1,100}$)[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DUP_STUDENT = "An application for this student has already been submitted. You cannot submit again.";
const DUP_PHIL = "This PhilSys ID number has already been used in a submitted application.";
const DUP_AUTH = "This authorized person has already submitted an application. An authorized person can only apply for one student.";
const BUSY = "The system is busy. Please wait a minute, then press Submit again. Your information is kept on this page.";

const s = (v) => String(v == null ? "" : v).trim();
const occ = (v) => { const t = s(v); return !!t && !/^(none|n\/?a|na|nil|-+|not applicable)$/i.test(t); };
const norm = (v) => s(v).replace(/\/\d{9}\s*$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const personKey = (p) =>
  ["municipality","barangay","lastName","firstName","middleName","extension"].map((k) => norm(p[k])).join("|") +
  "|" + norm(p.bMonth) + "-" + Number(p.bDay) + "-" + Number(p.bYear);

function bad(mn, d, y, maxY) {
  const m = MONTHS.indexOf(s(mn).toUpperCase()) + 1;
  const yy = Number(y), dd = Number(d);
  if (!m || !yy || yy < 1900 || yy > maxY) return true;
  const dt = new Date(yy, m - 1, dd);
  return dt.getFullYear() !== yy || dt.getMonth() !== m - 1 || dt.getDate() !== dd || dt > new Date();
}
const missing = (o, keys) => keys.find((k) => !s(o[k]));
const choice = (list, v) => s(v) !== "" && !list.includes(s(v));

function clean(o, upper) {
  const r = {};
  for (const [k, v] of Object.entries(o || {})) {
    if (typeof v === "boolean") { r[k] = v; continue; }
    let t = s(v).slice(0, 200).replace(/^[=+\-@\t\r]+/, "");
    if (upper.includes(k)) t = t.toUpperCase();
    r[k] = t;
  }
  return r;
}

function checkCommon(o, at, maxY) {
  if (!NAME_RE.test(s(o.lastName)) || !NAME_RE.test(s(o.firstName))) return at + "Invalid name.";
  if (s(o.middleName) && !NAME_RE.test(s(o.middleName))) return at + "Invalid middle name.";
  if (choice(SEX, o.sex) || choice(CIVIL, o.civilStatus) || choice(EXT, o.extension)) return at + "Invalid selection.";
  if (s(o.salary) && !/^\d+$/.test(s(o.salary))) return at + "Invalid monthly salary.";
  if (occ(o.occupation) && !Number(o.salary)) return at + "Monthly salary is required.";
  if (bad(o.bMonth, o.bDay, o.bYear, maxY)) return at + "Invalid birthday.";
  return "";
}

function validate(p, category, a, fam) {
  let e = missing(p, ["municipality","barangay","lastName","firstName","sex","civilStatus","bMonth","bDay","bYear","contact","philsys","email","yearLevel","school"]);
  if (e) return "Missing required field: " + e;
  e = checkCommon(p, "", 2014); if (e) return e;
  if (!/^09\d{9}$/.test(p.contact)) return "Invalid contact number.";
  if (!/^\d{16}$/.test(p.philsys)) return "Invalid PhilSys ID number.";
  if (!EMAIL_RE.test(p.email)) return "Invalid email address.";
  if (!YL[category].includes(p.yearLevel.toUpperCase())) return "Invalid year level.";
  if (!SCHOOL_RE.test(p.school)) return "Invalid school name.";

  if (category === "AUTHORIZATION") {
    if (!a || typeof a !== "object" || Array.isArray(a)) return "Authorized person details are missing.";
    const at = "Authorized person: ";
    e = missing(a, ["relationship","lastName","firstName","sex","civilStatus","bMonth","bDay","bYear","contact","philsys","municipality","barangay"]);
    if (e) return at + "missing " + e + ".";
    if (!REL.includes(a.relationship.toUpperCase())) return at + "invalid relationship.";
    e = checkCommon(a, at, new Date().getFullYear()); if (e) return e;
    if (!/^09\d{9}$/.test(a.contact)) return at + "invalid contact number.";
    if (!/^\d{16}$/.test(a.philsys)) return at + "invalid PhilSys ID number.";
    if (a.philsys === p.philsys) return "The authorized person and the student cannot have the same PhilSys number.";
    const t = new Date();
    const m = MONTHS.indexOf(a.bMonth.toUpperCase()) + 1;
    if (new Date(Number(a.bYear), m - 1, Number(a.bDay)) > new Date(t.getFullYear() - 18, t.getMonth(), t.getDate())) return at + "must be at least 18 years old.";
  }

  if (!Array.isArray(fam) || fam.length < 1 || fam.length > 3) return "Invalid family member data.";
  for (let i = 0; i < fam.length; i++) {
    const m = fam[i] || {}, at = "Family member " + (i + 1) + ": ";
    e = missing(m, ["relationship","lastName","firstName","sex","civilStatus","bMonth","bDay","bYear","municipality","barangay"]);
    if (e) return at + "missing " + e + ".";
    if (!REL.includes(String(m.relationship).toUpperCase())) return at + "invalid relationship.";
    e = checkCommon(m, at, new Date().getFullYear()); if (e) return e;
    if (s(m.contact) && !/^09\d{9}$/.test(s(m.contact))) return at + "invalid contact number.";
  }
  return "";
}

let st = { at: 0, state: null, notice: "NONE" };
async function siteState(gas, key) {
  if (st.state && Date.now() - st.at < 15000) return st;
  try {
    const r = await fetch(`${gas}?action=status&key=${encodeURIComponent(key)}`);
    const d = await r.json();
    if (d && typeof d.state === "string") st = { at: Date.now(), state: d.state, notice: d.notice || "NONE" };
  } catch {}
  return st; // may be slightly stale if Apps Script is busy
}

async function turnstileOk(token) {
  if (!TS || !token) return false;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret: TS, response: String(token) }),
    });
    return (await r.json()).success === true;
  } catch { return false; }
}

export async function handleSubmit(b, gas, key) {
  const category = s(b.category);
  if (!CATS.includes(category)) return { success: false, error: "Please choose a category." };
  if (s(b.family).length > 20000 || s(b.authorized).length > 5000) return { success: false, error: "Request too large." };

  const state = await siteState(gas, key);
  if (!state.state) return { success: false, error: BUSY };
  if (state.state !== "OPEN") return { success: false, code: state.state, error: "The application is not available." };

  let a = null, fam = null;
  try { fam = JSON.parse(b.family || "[]"); } catch {}
  if (category === "AUTHORIZATION") { try { a = JSON.parse(b.authorized || "null"); } catch {} }

  const p = {};
  for (const k of ["municipality","barangay","street","lastName","firstName","middleName","extension","sex","civilStatus","bMonth","bDay","bYear","contact","occupation","salary","philsys","email","yearLevel","school"]) p[k] = b[k];
  if (a && typeof a === "object" && b.sameAsAuth === "YES") { p.municipality = a.municipality; p.barangay = a.barangay; p.street = a.street; }
  if (Array.isArray(fam)) fam.forEach((m) => { if (m && m.sameAddress === true) { m.municipality = p.municipality; m.barangay = p.barangay; m.street = p.street; } });

  const student = clean(p, ["lastName","firstName","middleName","occupation","school"]);
  const auth = a && typeof a === "object" ? clean(a, ["lastName","firstName","middleName","occupation","relationship"]) : null;
  const family = Array.isArray(fam) ? fam.map((m) => clean(m || {}, ["lastName","firstName","middleName","occupation","relationship"])) : null;

  const err = validate(student, category, auth, family);
  if (err) return { success: false, error: err };
  if (!(await turnstileOk(b.turnstileToken))) return { success: false, error: "Verification failed or expired. Please complete the verification again." };

  const row = {
    category,
    philsys: student.philsys,
    person_key: personKey(student),
    auth_philsys: auth ? auth.philsys : null,
    payload: { student, authorized: auth, family, sameAsAuth: b.sameAsAuth === "YES", slot: state.notice === "FULL" ? "WAITLISTED" : "REGULAR", submitted: new Date().toISOString() },
  };
  const r = await fetch(`${SB}/rest/v1/applications`, {
    method: "POST",
    headers: { apikey: SBK, Authorization: `Bearer ${SBK}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
  });
  if (r.ok) return { success: true };
  const t = await r.text();
  if (r.status === 409 || t.includes("23505")) {
    if (t.includes("auth_philsys")) return { success: false, error: DUP_AUTH };
    if (t.includes("philsys_key")) return { success: false, error: DUP_PHIL };
    return { success: false, error: DUP_STUDENT };
  }
  console.error("Supabase insert failed", r.status, t.slice(0, 300));
  return { success: false, error: BUSY };
}