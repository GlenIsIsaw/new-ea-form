import { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import DataPrivacyModal from "./components/DataPrivacyModal";
import InstructionModal from "./components/InstructionModal";
import ConfirmationModal from "./components/ConfirmationModal";
import { MUNICIPALITIES, BARANGAYS } from "./data/locations";
import ReviewModal from "./components/ReviewModal";
import SuccessPage from "./components/SucessPageWrapper";

const MONTHS = [
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
const EXTENSIONS = ["JR.", "SR.", "II", "III", "IV", "V"];
const SEX = ["MALE", "FEMALE"];
const CIVIL = ["SINGLE", "MARRIED", "SEPARATED", "WIDOW/WIDOWER", "COMMON-LAW"];
const THIS_YEAR = new Date().getFullYear();
const MAX_BIRTH_YEAR = 2014;
const YEARS = Array.from({ length: 101 }, (_, i) => MAX_BIRTH_YEAR - i);

const NAME_RE = /^[A-Za-zÀ-ÿñÑ]+(?:[ '-][A-Za-zÀ-ÿñÑ]+)*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const daysIn = (m, y) => (m ? new Date(y || 2024, Number(m), 0).getDate() : 31);

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
  municipality: (v) => (v ? "" : "Please select your municipality."),
  barangay: (v) => (v ? "" : "Please select your barangay."),
};

const INITIAL = {
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

export default function App() {
  const [f, setF] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [step, setStep] = useState("privacy"); // privacy -> instructions -> form
  const [showReview, setShowReview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [showLeave, setShowLeave] = useState(false);
  const leavingRef = useRef(false);
  const guardedRef = useRef(false);
  const isDirty = JSON.stringify(f) !== JSON.stringify(INITIAL);

  const check = (name, next = f) => validators[name]?.(next[name], next) ?? "";
  const setError = (name, msg) => setErrors((p) => ({ ...p, [name]: msg }));

  const update = (name, value) => {
    setF((p) => {
      const next = { ...p, [name]: value };
      if (name === "municipality") next.barangay = "";
      if (name === "bMonth" || name === "bYear") {
        if (Number(next.bDay) > daysIn(next.bMonth, next.bYear)) next.bDay = "";
      }
      return next;
    });
  };

  const nameText = (name) => (e) => {
    update(name, e.target.value.normalize("NFC"));
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

  const review = (e) => {
    e.preventDefault();
    const found = {};
    Object.keys(validators).forEach((k) => {
      const m = check(k);
      if (m) found[k] = m;
    });
    setErrors(found);
    if (Object.keys(found).length) {
      setTimeout(() => {
        document
          .querySelector(".is-invalid, .d-block.invalid-feedback")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      return;
    }
    setReviewData({
      ...f,
      birthday: `${MONTHS[f.bMonth - 1]} ${f.bDay}, ${f.bYear}`,
      salary: f.salary ? `₱${Number(f.salary).toLocaleString("en-PH")}` : "",
    });
    setShowReview(true);
  };

  const submit = () => {
    setShowConfirm(false);
    // TODO: send `f` to the Google Apps Script web app
    setDone(true);
  };

  const reset = () => {
    setF(INITIAL);
    setErrors({});
    setDone(false);
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

  if (done)
    return (
      <SuccessPage
        onNewSubmission={() => {
          setF(INITIAL);
          setErrors({});
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
    <div className="form-wrapper">
      <div className="form-header">
        <h1>Educational Assistance 2026</h1>
        <p>Please fill out all required fields marked with an asterisk (*)</p>
      </div>

      <div className="form-body">
        <Form onSubmit={review} noValidate>
          <section className="mb-4">
            <div className="section-title">Full Name</div>
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
                {!errors.middleName && (
                  <div className="field-hint">
                    
                  </div>
                )}
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Label>Extension Name</Label>
                <Form.Select value={f.extension} onChange={text("extension")}>
                  <option value="">None</option>
                  {EXTENSIONS.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <div className="section-title my-4">Personal Information</div>
            <Row className="g-3">
              <Col xs={12} md={6}>
                <Label required>Sex</Label>
                <Form.Select
                  value={f.sex}
                  onChange={text("sex")}
                  onBlur={blur("sex")}
                  isInvalid={!!errors.sex}
                >
                  <option value="">Select sex</option>
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
                  <option value="">Select civil status</option>
                  {CIVIL.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Form.Select>
                <Err msg={errors.civilStatus} />
              </Col>

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
              Contact and Other information
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
                    text("occupation")(e);
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

          <div className="submit-row d-flex justify-content-end gap-2">
            <Button
              variant="outline-secondary"
              type="button"
              className="px-4"
              onClick={reset}
            >
              Reset
            </Button>
            <Button type="submit" variant="primary" className="px-4 btn-submit">
              Submit
            </Button>
          </div>
        </Form>
      </div>

      <DataPrivacyModal
        show={step === "privacy"}
        onAccept={() => setStep("instructions")}
      />
      <InstructionModal
        show={step === "instructions"}
        onAccept={() => setStep("form")}
      />

      <ReviewModal
        show={showReview}
        onHide={() => setShowReview(false)}
        data={reviewData}
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
    </div>
  );
}
