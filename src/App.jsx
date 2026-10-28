import { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import DataPrivacyModal from "./components/DataPrivacyModal";
import InstructionModal from "./components/InstructionModal";
import ConfirmationModal from "./components/ConfirmationModal";
import { MUNICIPALITIES, BARANGAYS } from "./data/locations";
import ReviewModal from "./components/ReviewModal";
import SuccessPage from "./components/SucessPageWrapper";
import { SCHOOL_GROUPS, OUTSIDE_CN } from "./data/school";
import { MONTHS, EXTENSIONS, SEX, CIVIL, daysIn } from "./data/options";
import {
  MAX_FAMILY,
  emptyMember,
  validateMember,
  validateMemberField,
} from "./data/family";
import FamilyMemberCard from "./components/FamilyMemberCard";
import { Turnstile } from "@marsidev/react-turnstile";
import CategoryGate, { CATEGORY_LABELS } from "./components/CategoryGate";
import {
  useSiteStatus,
  StatusLoading,
  MaintenancePage,
  ClosedPage,
  StatusError,
} from "./components/SiteGate";

const TURNSTILE_SITE_KEY = "0x4AAAAAAFntaeOi6xSmnaDl";
const API_URL =
  "https://script.google.com/macros/s/AKfycbyd1RnD-CiHMK_I2sfnbTxbEQrM46fMMnlA07-lp8UV8YNCOEHqDbvj-3Vq6B6ChGoL/exec";

const THIS_YEAR = new Date().getFullYear();
const MAX_BIRTH_YEAR = 2014;
const YEARS = Array.from({ length: 101 }, (_, i) => MAX_BIRTH_YEAR - i);
const YEAR_LEVELS = [
  "1ST YEAR",
  "2ND YEAR",
  "3RD YEAR",
  "4TH YEAR",
  "5TH YEAR",
];

const NAME_RE = /^[A-Za-zÀ-ÿñÑ]+(?:[ '-][A-Za-zÀ-ÿñÑ]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SCHOOL_RE = /^[A-Za-zÀ-ÿñÑ0-9 .,'’&()/-]{3,150}$/;

const hasOccupation = (v) =>
  !!v.trim() && !/^(none|n\/?a|na|nil|-+|not applicable)$/i.test(v.trim());

const validators = {
  salary: (v, f) =>
    !hasOccupation(f.occupation)
      ? ""
      : !v || Number(v) <= 0
        ? "Monthly salary is required when you enter an occupation."
        : "",

  lastName: (v) =>
    !v.trim()
      ? "Please enter your last name."
      : !NAME_RE.test(v.trim())
        ? "Use letters only (no periods or numbers)."
        : "",
  firstName: (v) =>
    !v.trim()
      ? "Please enter your first name."
      : !NAME_RE.test(v.trim())
        ? "Use letters only (no periods or numbers)."
        : "",
  middleName: (v) => {
    const t = v.trim();
    if (!t) return "";
    if (/^(n\/?a|none)$/i.test(t))
      return "Leave this blank if you have no middle name.";
    if (!NAME_RE.test(t))
      return "Write your full middle name. Do not use initials or periods.";
    if (t.split(/[ '-]/).every((w) => w.length === 1))
      return "Write your full middle name, not an initial.";
    return "";
  },
  sex: (v) => (v ? "" : "Please select your sex."),
  civilStatus: (v) => (v ? "" : "Please select your civil status."),
  birthday: (_, f) => {
    if (!f.bMonth || !f.bDay || !f.bYear)
      return "Please select your complete birthday.";
    return Number(f.bYear) > MAX_BIRTH_YEAR
      ? `Birth year must be ${MAX_BIRTH_YEAR} or earlier.`
      : "";
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
  email: (v) =>
    !v.trim()
      ? "Please enter your email address."
      : !EMAIL_RE.test(v.trim())
        ? "Enter a valid email address."
        : "",
  school: (v) => (v ? "" : "Please select your school."),
  otherSchool: (v, f) =>
    f.school !== OUTSIDE_CN
      ? ""
      : !v.trim()
        ? "Please type the name of your school/university."
        : !SCHOOL_RE.test(v.trim())
          ? "Use letters, numbers and basic punctuation only."
          : "",
  municipality: (v) => (v ? "" : "Please select your municipality."),
  barangay: (v) => (v ? "" : "Please select your barangay."),
  yearLevel: (v) => (v ? "" : "Please select your year level."),
};

const INITIAL = {
  lastName: "",
  firstName: "",
  middleName: "",
  extension: "",
  sex: "",
  civilStatus: "",
  yearLevel: "",
  school: "",
  otherSchool: "",
  bMonth: "",
  bDay: "",
  bYear: "",
  contact: "",
  occupation: "",
  salary: "",
  philsys: "",
  email: "",
  municipality: "",
  barangay: "",
  street: "",
};

const Err = ({ msg }) =>
  msg ? (
    <Form.Control.Feedback type="invalid" className="d-block">
      {msg}
    </Form.Control.Feedback>
  ) : null;
const Label = ({ children, required }) => (
  <Form.Label className="form-label">
    {children}
    {required && <span className="required">*</span>}
  </Form.Label>
);

// Remembers ONLY the chosen category (not any personal data) for this tab
const readGate = () => {
  try {
    const g = JSON.parse(sessionStorage.getItem("gate") || "null");
    return g &&
      Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, g.category)
      ? g
      : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [f, setF] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [saved] = useState(readGate);
  const [step, setStep] = useState(saved ? "form" : "choose");
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [showLeave, setShowLeave] = useState(false);
  const [category, setCategory] = useState(saved ? saved.category : null);
  const [consented, setConsented] = useState(!!saved);
  const [showChange, setShowChange] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const turnstileRef = useRef(null);
  const { status, setStatus, check: recheckStatus } = useSiteStatus(API_URL);

  // family states: these must come BEFORE isDirty
  const [family, setFamily] = useState([emptyMember()]);
  const [familyErrors, setFamilyErrors] = useState([{}]);
  const effectiveFamily = family.map((m) =>
    m.sameAddress
      ? {
          ...m,
          municipality: f.municipality,
          barangay: f.barangay,
          street: f.street,
        }
      : m,
  );
  const [removeIndex, setRemoveIndex] = useState(null);

  const leavingRef = useRef(false);
  const guardedRef = useRef(false);

  // now it's safe to use `family`
  const isDirty =
    JSON.stringify(f) !== JSON.stringify(INITIAL) ||
    JSON.stringify(family) !== JSON.stringify([emptyMember()]);

  const check = (name, next = f) => validators[name]?.(next[name], next) ?? "";
  const setError = (name, msg) => setErrors((p) => ({ ...p, [name]: msg }));

  const update = (name, value) => {
    setF((p) => {
      const next = { ...p, [name]: value };
      if (name === "municipality") next.barangay = "";
      if (name === "school" && value !== OUTSIDE_CN) next.otherSchool = "";
      if (name === "bMonth" || name === "bYear") {
        if (Number(next.bDay) > daysIn(next.bMonth, next.bYear)) next.bDay = "";
      }
      return next;
    });
  };

  const nameText = (name) => (e) => {
    update(name, e.target.value.normalize("NFC").toUpperCase());
    if (errors[name]) setError(name, "");
  };

  const text = (name) => (e) => {
    update(name, e.target.value);
    if (errors[name]) setError(name, "");
  };
  const digits = (name, max) => (e) => {
    update(name, e.target.value.replace(/\D/g, "").slice(0, max));
    if (errors[name]) setError(name, "");
  };
  const blur = (name) => () => setError(name, check(name));
  const dob = (name) => (e) => {
    update(name, e.target.value);
    setError("birthday", "");
  };

  const RELATED = {
    bMonth: "birthday",
    bDay: "birthday",
    bYear: "birthday",
    occupation: "salary",
  };

  const addMember = () => {
    if (family.length >= MAX_FAMILY) return;
    const newIndex = family.length;
    setFamily((p) => [...p, emptyMember()]);
    setFamilyErrors((p) => [...p, {}]);
    setTimeout(
      () =>
        document
          .getElementById(`family-${newIndex}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50,
    );
  };

  const updateMember = (i, name, value) => {
    setFamily((p) =>
      p.map((m, idx) => {
        if (idx !== i) return m;
        const next = { ...m, [name]: value };
        if (name === "municipality") next.barangay = "";
        if (
          (name === "bMonth" || name === "bYear") &&
          Number(next.bDay) > daysIn(next.bMonth, next.bYear)
        )
          next.bDay = "";
        return next;
      }),
    );
    const cleared = Object.fromEntries(
      [name, RELATED[name]].filter(Boolean).map((k) => [k, ""]),
    );
    setFamilyErrors((p) =>
      p.map((e, idx) => (idx === i ? { ...e, ...cleared } : e)),
    );
  };

  const setSameAddress = (i, checked) => {
    setFamily((p) =>
      p.map((m, idx) =>
        idx !== i
          ? m
          : checked
            ? { ...m, sameAddress: true }
            : {
                ...m,
                sameAddress: false,
                municipality: f.municipality,
                barangay: f.barangay,
                street: f.street,
              },
      ),
    );
    setFamilyErrors((p) =>
      p.map((e, idx) =>
        idx === i ? { ...e, municipality: "", barangay: "" } : e,
      ),
    );
  };

  const blurMember = (i, name) =>
    setFamilyErrors((p) =>
      p.map((e, idx) =>
        idx === i ? { ...e, [name]: validateMemberField(name, family[i]) } : e,
      ),
    );

  const doRemove = (i) => {
    setFamily((p) => p.filter((_, idx) => idx !== i));
    setFamilyErrors((p) => p.filter((_, idx) => idx !== i));
    setRemoveIndex(null);
  };
  const askRemove = (i) =>
    JSON.stringify(family[i]) === JSON.stringify(emptyMember())
      ? doRemove(i)
      : setRemoveIndex(i);

  const review = (e) => {
    e.preventDefault();

    // student fields
    const found = {};
    Object.keys(validators).forEach((k) => {
      const m = check(k);
      if (m) found[k] = m;
    });
    setErrors(found);

    // family members: every member needs the required details
    const famErrs = effectiveFamily.map((m) => validateMember(m));
    setFamilyErrors(famErrs);
    const famInvalid = famErrs.some((er) => Object.keys(er).length > 0);

    // verification
    if (!captchaToken) setCaptchaError("Please complete the verification.");

    // stop here if ANYTHING is missing
    if (Object.keys(found).length || famInvalid || !captchaToken) {
      setTimeout(() => {
        document
          .querySelector(".is-invalid, .d-block.invalid-feedback, .text-danger")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }

    setReviewData({
      ...f,
      school: f.school === OUTSIDE_CN ? f.otherSchool.trim() : f.school,
      birthday: `${MONTHS[f.bMonth - 1]} ${f.bDay}, ${f.bYear}`,
      salary: f.salary ? `₱${Number(f.salary).toLocaleString("en-PH")}` : "",
    });
    setShowReview(true);
  };

  const submit = async () => {
    if (!captchaToken) {
      setShowConfirm(false);
      setCaptchaError(
        "Verification expired. Please complete it again, then submit.",
      );
      return;
    }
    setShowConfirm(false);
    setSubmitting(true);
    try {
      // ① NEW: build the family list (goes ABOVE `const body`)
      const familyPayload = effectiveFamily.map((m) => ({
        relationship: m.relationship,
        lastName: m.lastName.trim(),
        firstName: m.firstName.trim(),
        middleName: m.middleName.trim(),
        extension: m.extension,
        sex: m.sex,
        civilStatus: m.civilStatus,
        bMonth: MONTHS[m.bMonth - 1],
        bDay: m.bDay,
        bYear: m.bYear,
        contact: m.contact,
        occupation: m.occupation.trim(),
        salary: m.salary,
        sameAddress: m.sameAddress,
        municipality: m.municipality,
        barangay: m.barangay,
        street: m.street.trim(),
      }));

      const body = new URLSearchParams({
        municipality: f.municipality,
        barangay: f.barangay,
        street: f.street.trim(),
        lastName: f.lastName.trim(),
        firstName: f.firstName.trim(),
        middleName: f.middleName.trim(),
        extension: f.extension,
        sex: f.sex,
        civilStatus: f.civilStatus,
        yearLevel: f.yearLevel,
        school: f.school === OUTSIDE_CN ? f.otherSchool.trim() : f.school,
        bMonth: MONTHS[f.bMonth - 1],
        bDay: f.bDay,
        bYear: f.bYear,
        contact: f.contact,
        occupation: f.occupation.trim(),
        salary: f.salary,
        philsys: f.philsys,
        email: f.email.trim(),
        family: JSON.stringify(familyPayload),
        category: category,
        turnstileToken: captchaToken, // ② NEW: add this line at the end of the list
      });

      const res = await fetch(API_URL, { method: "POST", body });
      const result = await res.json();
      if (result.success) setDone(true);
      else if (result.code === "MAINTENANCE" || result.code === "CLOSED")
        setStatus(result.code);
      else alert(result.error || "Submission failed. Please try again.");
    } catch (err) {
      console.error(err);
      alert("Unable to connect. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
    setCaptchaToken("");
    turnstileRef.current?.reset();
  };

  const reset = () => {
    setF(INITIAL);
    setErrors({});
    setDone(false);
    setFamily([emptyMember()]);
    setFamilyErrors([{}]);
  };

  const resetAll = () => {
    setF(INITIAL);
    setErrors({});
    setFamily([emptyMember()]);
    setFamilyErrors([{}]);
    setCaptchaToken("");
    turnstileRef.current?.reset();
  };

  useEffect(() => {
    if (!isDirty || done) return;

    // Tab close / refresh: browser's own warning
    const onBeforeUnload = (e) => {
      if (leavingRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };

    // Back button: add one guard entry so we can intercept it
    if (!guardedRef.current) {
      window.history.pushState({ formGuard: true }, "");
      guardedRef.current = true;
    }
    const onPopState = () => {
      if (leavingRef.current) return;
      window.history.pushState({ formGuard: true }, ""); // stay on the page
      setShowLeave(true);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [isDirty, done]);

  const leavePage = () => {
    leavingRef.current = true;
    setShowLeave(false);
    window.history.go(-2); // skips the guard entries
    setTimeout(() => {
      leavingRef.current = false;
    }, 1500); // if there was nowhere to go back to
  };

  useEffect(() => {
    try {
      if (step === "form" && category && !done) {
        sessionStorage.setItem("gate", JSON.stringify({ category }));
      } else {
        sessionStorage.removeItem("gate");
      }
    } catch {
      /* storage blocked (private mode): ignore */
    }
  }, [step, category, done]);

  if (submitting)
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center text-center px-3"
        style={{ height: "100vh" }}
      >
        <div
          className="spinner-border mb-3"
          role="status"
          style={{ color: "#1a5c38" }}
        />
        <h4 style={{ color: "#1a5c38", fontWeight: 700 }}>
          Submitting your information...
        </h4>
        <p className="text-muted">
          Please wait. <strong>DO NOT CLOSE THIS WINDOW.</strong>
        </p>
      </div>
    );

  if (done)
    return (
      <SuccessPage
        onNewSubmission={() => {
          setF(INITIAL);
          setErrors({});
          setFamily([emptyMember()]);
          setFamilyErrors([{}]);
        }}
      />
    );

  if (status === null) return <StatusLoading />;
  if (status === "MAINTENANCE")
    return <MaintenancePage onRetry={recheckStatus} />;
  if (status === "CLOSED") return <ClosedPage onRetry={recheckStatus} />;
  if (status === "ERROR") return <StatusError onRetry={recheckStatus} />;

  if (step === "choose")
    return (
      <CategoryGate
        onSelect={(key) => {
          setCategory(key);
          setStep(consented ? "instructions" : "privacy");
        }}
      />
    );

  const barangays = BARANGAYS[f.municipality] || [];

  const dash = (v) => (String(v).trim() ? String(v).trim() : "—");
  const money = f.salary ? `₱${Number(f.salary).toLocaleString("en-PH")}` : "";
  const birthdayText =
    f.bMonth && f.bDay && f.bYear
      ? `${MONTHS[f.bMonth - 1]} ${f.bDay}, ${f.bYear}`
      : "";
  const reviewSections = [
    {
      title: "Personal Information",
      rows: [
        ["Last Name", f.lastName],
        ["First Name", f.firstName],
        ["Middle Name", f.middleName],
        ["Extension Name", f.extension],
        ["Sex", f.sex],
        ["Civil Status", f.civilStatus],
        ["Birthday", birthdayText],
        ["Contact Number", f.contact],
        ["Occupation", f.occupation],
        ["Monthly Salary", money],
        ["PhilSys ID No.", f.philsys],
        ["Email", f.email],
      ],
    },
    {
      title: "Address",
      rows: [
        ["Municipality", f.municipality],
        ["Barangay", f.barangay],
        ["Street / Purok", f.street],
      ],
    },
  ];

  return (
    <div className={step === "form" ? "form-wrapper" : ""}>
      {step === "form" && (
        <>
          <div className="form-header">
            <h1>Educational Assistance 2026</h1>
            <p>
              Please fill out all required fields marked with an asterisk (*)
            </p>
            <span className="category-chip">{CATEGORY_LABELS[category]}</span>
            <button
              type="button"
              className="category-change"
              onClick={() =>
                isDirty
                  ? setShowChange(true)
                  : (setCategory(null), setStep("choose"))
              }
            >
              Change
            </button>
          </div>

          <div className="form-body">
            <Form onSubmit={review} noValidate>
              <section className="mb-4">
                <div className="section-title">Student's Full Name</div>
                <Row className="g-3">
                  <Col xs={12} md={6} lg={3}>
                    <Label required>Last Name</Label>
                    <Form.Control
                      value={f.lastName}
                      onChange={nameText("lastName")}
                      onBlur={blur("lastName")}
                      isInvalid={!!errors.lastName}
                      autoComplete="family-name"
                    />
                    <Err msg={errors.lastName} />
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Label required>First Name</Label>
                    <Form.Control
                      value={f.firstName}
                      onChange={nameText("firstName")}
                      onBlur={blur("firstName")}
                      isInvalid={!!errors.firstName}
                      autoComplete="given-name"
                    />
                    <Err msg={errors.firstName} />
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Label>Middle Name</Label>
                    <Form.Control
                      value={f.middleName}
                      onChange={nameText("middleName")}
                      onBlur={blur("middleName")}
                      isInvalid={!!errors.middleName}
                      autoComplete="additional-name"
                    />
                    <Err msg={errors.middleName} />
                    {!errors.middleName && <div className="field-hint"></div>}
                  </Col>
                  <Col xs={12} md={6} lg={3}>
                    <Label>Extension Name</Label>
                    <Form.Select
                      value={f.extension}
                      onChange={text("extension")}
                    >
                      <option value="">None</option>
                      {EXTENSIONS.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
                <div className="section-title my-4">
                  Student's Personal Information
                </div>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Label required>Gender</Label>
                    <Form.Select
                      value={f.sex}
                      onChange={text("sex")}
                      onBlur={blur("sex")}
                      isInvalid={!!errors.sex}
                    >
                      <option value="">Select Gender</option>
                      {SEX.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </Form.Select>
                    <Err msg={errors.sex} />
                  </Col>

                  <Col xs={12} md={6}>
                    <Label required>Civil Status</Label>
                    <Form.Select
                      value={f.civilStatus}
                      onChange={text("civilStatus")}
                      onBlur={blur("civilStatus")}
                      isInvalid={!!errors.civilStatus}
                    >
                      <option value="">Select Civil Status</option>
                      {CIVIL.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </Form.Select>
                    <Err msg={errors.civilStatus} />
                  </Col>

                  <Row className="g-3 mt-0">
                    <Col xs={12} md={8}>
                      <Label required>School / University</Label>
                      <Form.Select
                        value={f.school}
                        onChange={text("school")}
                        onBlur={blur("school")}
                        isInvalid={!!errors.school}
                      >
                        <option value="">Select School / University</option>
                        {SCHOOL_GROUPS.map((g) => (
                          <optgroup key={g.label} label={g.label}>
                            {g.options.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                        <option value={OUTSIDE_CN}>{OUTSIDE_CN}</option>
                      </Form.Select>
                      <Err msg={errors.school} />
                    </Col>

                    <Col xs={12} md={4}>
                      <Label required>Year Level</Label>
                      <Form.Select
                        value={f.yearLevel}
                        onChange={text("yearLevel")}
                        onBlur={blur("yearLevel")}
                        isInvalid={!!errors.yearLevel}
                      >
                        <option value="">Select Year Level</option>
                        {YEAR_LEVELS.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </Form.Select>
                      <Err msg={errors.yearLevel} />
                    </Col>

                    {f.school === OUTSIDE_CN && (
                      <Col xs={12}>
                        <Label required>Name of School / University</Label>
                        <Form.Control
                          value={f.otherSchool}
                          onChange={(e) => {
                            update("otherSchool", e.target.value.toUpperCase());
                            if (errors.otherSchool) setError("otherSchool", "");
                          }}
                          onBlur={blur("otherSchool")}
                          isInvalid={!!errors.otherSchool}
                          placeholder="Type the full name of your school/university"
                        />
                        <Err msg={errors.otherSchool} />
                      </Col>
                    )}
                  </Row>

                  <Col xs={12}>
                    <Label required>Birthday</Label>
                    <Row className="g-2">
                      <Col xs={12} sm={5}>
                        <Form.Select
                          aria-label="Birth month"
                          value={f.bMonth}
                          onChange={dob("bMonth")}
                          isInvalid={!!errors.birthday && !f.bMonth}
                        >
                          <option value="">Month</option>
                          {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>
                              {m}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col xs={6} sm={3}>
                        <Form.Select
                          aria-label="Birth day"
                          value={f.bDay}
                          onChange={dob("bDay")}
                          isInvalid={!!errors.birthday && !f.bDay}
                        >
                          <option value="">Day</option>
                          {Array.from(
                            { length: daysIn(f.bMonth, f.bYear) },
                            (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ),
                          )}
                        </Form.Select>
                      </Col>
                      <Col xs={6} sm={4}>
                        <Form.Select
                          aria-label="Birth year"
                          value={f.bYear}
                          onChange={dob("bYear")}
                          isInvalid={!!errors.birthday && !f.bYear}
                        >
                          <option value="">Year</option>
                          {YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>
                    <Err msg={errors.birthday} />
                  </Col>
                </Row>
                <div className="section-title my-4">
                  Student's Contact and Other information
                </div>
                <Row className="g-3">
                  <Col xs={12}>
                    <Label required>PhilSys ID No.</Label>
                    <Form.Control
                      inputMode="numeric"
                      value={f.philsys}
                      onChange={digits("philsys", 16)}
                      onBlur={blur("philsys")}
                      placeholder="16-digit number"
                      maxLength={16}
                      isInvalid={!!errors.philsys}
                      autoComplete="off"
                    />
                    <Err msg={errors.philsys} />
                  </Col>
                  <Col xs={12} md={6}>
                    <Label>Occupation</Label>
                    <Form.Control
                      value={f.occupation}
                      onChange={(e) => {
                        update("occupation", e.target.value.toUpperCase());
                        if (errors.salary) setError("salary", "");
                      }}
                      placeholder="Type None or leave it blank if you have no occupation"
                    />
                  </Col>
                  <Col xs={12} md={6}>
                    <Label required={hasOccupation(f.occupation)}>
                      Monthly Salary
                    </Label>
                    <Form.Control
                      inputMode="numeric"
                      value={f.salary}
                      onChange={digits("salary", 9)}
                      onBlur={blur("salary")}
                      isInvalid={!!errors.salary}
                    />
                    <Err msg={errors.salary} />
                    {!errors.salary && hasOccupation(f.occupation) && (
                      <div className="field-hint">
                        Required because you entered an occupation.
                      </div>
                    )}
                  </Col>
                  <Col xs={12} md={6}>
                    <Label required>Contact Number</Label>
                    <Form.Control
                      type="tel"
                      inputMode="numeric"
                      value={f.contact}
                      onChange={digits("contact", 11)}
                      onBlur={blur("contact")}
                      placeholder="09XXXXXXXXX"
                      maxLength={11}
                      isInvalid={!!errors.contact}
                      autoComplete="tel"
                    />
                    <Err msg={errors.contact} />
                  </Col>
                  <Col xs={12} md={6}>
                    <Label required>Email</Label>
                    <Form.Control
                      type="email"
                      value={f.email}
                      onChange={text("email")}
                      onBlur={blur("email")}
                      placeholder="name@example.com"
                      isInvalid={!!errors.email}
                      autoComplete="email"
                    />
                    <Err msg={errors.email} />
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <div className="section-title">Address</div>
                <Row className="g-3">
                  <Col xs={12} md={6}>
                    <Label required>Municipality</Label>
                    <Form.Select
                      value={f.municipality}
                      onChange={text("municipality")}
                      onBlur={blur("municipality")}
                      isInvalid={!!errors.municipality}
                    >
                      <option value="">Select municipality</option>
                      {MUNICIPALITIES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Form.Select>
                    <Err msg={errors.municipality} />
                  </Col>
                  <Col xs={12} md={6}>
                    <Label required>Barangay</Label>
                    <Form.Select
                      value={f.barangay}
                      onChange={text("barangay")}
                      onBlur={blur("barangay")}
                      disabled={!f.municipality}
                      isInvalid={!!errors.barangay}
                    >
                      <option value="">
                        {f.municipality
                          ? "Select barangay"
                          : "Select municipality first"}
                      </option>
                      {barangays.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </Form.Select>
                    <Err msg={errors.barangay} />
                  </Col>
                  <Col xs={12}>
                    <Label>Street / Purok</Label>
                    <Form.Control
                      value={f.street}
                      onChange={text("street")}
                      autoComplete="street-address"
                    />
                  </Col>
                </Row>
              </section>

              <section className="mb-4">
                <div className="section-title">Family Members</div>
                <p className="family-help">
                  <span>
                    Add at least 1 and up to {MAX_FAMILY} family members.
                  </span>
                  <span className="family-count">
                    {family.length} of {MAX_FAMILY} added
                  </span>
                </p>

                {family.map((m, i) => (
                  <FamilyMemberCard
                    key={i}
                    index={i}
                    member={effectiveFamily[i]}
                    errors={familyErrors[i]}
                    onChange={(name, value) => updateMember(i, name, value)}
                    onBlurField={(name) => blurMember(i, name)}
                    onRemove={() => askRemove(i)}
                    canRemove={family.length > 1}
                    onSameAddress={(checked) => setSameAddress(i, checked)}
                  />
                ))}

                <div className="family-add-row">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="family-add-btn"
                    onClick={addMember}
                    disabled={family.length >= MAX_FAMILY}
                  >
                    + Add Another Family Member
                  </Button>
                  {family.length >= MAX_FAMILY && (
                    <span className="field-hint">
                      Maximum of {MAX_FAMILY} family members reached.
                    </span>
                  )}
                </div>
              </section>

              <div className="mb-3 d-flex flex-column align-items-start">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(t) => {
                    setCaptchaToken(t);
                    setCaptchaError("");
                  }}
                  onExpire={() => setCaptchaToken("")}
                  onError={() => {
                    setCaptchaToken("");
                    setCaptchaError(
                      "Verification could not load. Try turning off VPN or ad blockers, or use another browser.",
                    );
                  }}
                />
                {captchaError && (
                  <div className="text-danger small mt-1">{captchaError}</div>
                )}
              </div>

              <div className="submit-row d-flex justify-content-end gap-2">
                <Button
                  variant="outline-secondary"
                  type="button"
                  className="px-4"
                  onClick={() => setShowResetModal(true)}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-4 btn-submit"
                >
                  Submit
                </Button>
              </div>
            </Form>
          </div>
        </>
      )}
      <DataPrivacyModal
        show={step === "privacy"}
        onAccept={() => {
          setConsented(true);
          setStep("instructions");
        }}
      />
      <InstructionModal
        show={step === "instructions"}
        onAccept={() => setStep("form")}
      />

      <ReviewModal
        show={showReview}
        onHide={() => setShowReview(false)}
        data={reviewData}
        family={effectiveFamily}
        onConfirm={() => {
          setShowReview(false);
          setShowConfirm(true);
        }}
      />

      <ConfirmationModal
        show={showConfirm}
        onHide={() => {
          setShowConfirm(false);
          setShowReview(true);
        }}
        onConfirm={submit}
        title="Submit Form"
        message="Are you sure you want to submit this form?"
        subMessage="You will no longer be able to edit the information after submission."
        confirmText="Submit"
      />

      <ConfirmationModal
        show={showResetModal}
        onHide={() => setShowResetModal(false)}
        onConfirm={() => {
          reset();
          setShowResetModal(false);
        }}
        title="Reset Form"
        message="Are you sure you want to reset the form?"
        subMessage="All changes will be lost."
        confirmText="Yes, Reset"
        confirmVariant="danger"
      />

      <ConfirmationModal
        show={showLeave}
        onHide={() => setShowLeave(false)}
        onConfirm={leavePage}
        title="Leave Page"
        message="Are you sure you want to leave?"
        subMessage="Changes will not be saved. Your form will be lost."
        confirmText="Leave"
        cancelText="Stay"
        confirmVariant="danger"
      />

      <ConfirmationModal
        show={removeIndex !== null}
        onHide={() => setRemoveIndex(null)}
        onConfirm={() => doRemove(removeIndex)}
        title="Remove Family Member"
        message={`Remove Family Member ${(removeIndex ?? 0) + 1}?`}
        subMessage="The information you entered for this person will be deleted."
        confirmText="Yes, Remove"
        confirmVariant="danger"
      />

      <ConfirmationModal
        show={showChange}
        onHide={() => setShowChange(false)}
        onConfirm={() => {
          resetAll();
          setShowChange(false);
          setCategory(null);
          setStep("choose");
        }}
        title="Change Category"
        message="Do you want to change your category?"
        subMessage="Everything you entered on this form will be cleared."
        confirmText="Yes, Change"
        confirmVariant="danger"
      />
    </div>
  );
}
