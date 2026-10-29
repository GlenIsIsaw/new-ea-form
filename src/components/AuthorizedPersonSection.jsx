import { Row, Col, Form } from "react-bootstrap";
import { MONTHS, EXTENSIONS, SEX, CIVIL, daysIn } from "../data/options";
import { MUNICIPALITIES, BARANGAYS } from "../data/locations";
import { RELATIONSHIPS, AUTH_YEARS } from "../data/authorized";
import { hasOccupation } from "../data/family";

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

// The person who applies on behalf of the student. Same look as the student's sections.
export default function AuthorizedPersonSection({
  data: a,
  errors = {},
  onChange,
  onBlurField,
}) {
  const set = (name) => (e) => onChange(name, e.target.value);
  const nameSet = (name) => (e) =>
    onChange(name, e.target.value.normalize("NFC").toUpperCase());
  const digits = (name, max) => (e) =>
    onChange(name, e.target.value.replace(/\D/g, "").slice(0, max));
  const blur = (name) => () => onBlurField(name);

  return (
    <>
      <section className="mb-4">
        <p className="family-help">
          <span>
            Fill in YOUR details first (the authorized person). The student's
            details come after.
          </span>
        </p>

        <div className="section-title">Authorized Person's Full Name</div>
        <Row className="g-3">
          <Col xs={12} md={6} lg={3}>
            <Label required>Last Name</Label>
            <Form.Control
              value={a.lastName}
              onChange={nameSet("lastName")}
              onBlur={blur("lastName")}
              isInvalid={!!errors.lastName}
              autoComplete="off"
            />
            <Err msg={errors.lastName} />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Label required>First Name</Label>
            <Form.Control
              value={a.firstName}
              onChange={nameSet("firstName")}
              onBlur={blur("firstName")}
              isInvalid={!!errors.firstName}
              autoComplete="off"
            />
            <Err msg={errors.firstName} />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Label>Middle Name</Label>
            <Form.Control
              value={a.middleName}
              onChange={nameSet("middleName")}
              onBlur={blur("middleName")}
              isInvalid={!!errors.middleName}
              autoComplete="off"
            />
            <Err msg={errors.middleName} />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Label>Extension Name</Label>
            <Form.Select value={a.extension} onChange={set("extension")}>
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
          Authorized Person's Personal Information
        </div>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Label required>Gender</Label>
            <Form.Select
              value={a.sex}
              onChange={set("sex")}
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
              value={a.civilStatus}
              onChange={set("civilStatus")}
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
          <Col xs={12}>
            <Label required>Birthday</Label>
            <Row className="g-2">
              <Col xs={12} sm={5}>
                <Form.Select
                  aria-label="Birth month"
                  value={a.bMonth}
                  onChange={set("bMonth")}
                  isInvalid={!!errors.birthday && !a.bMonth}
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
                  value={a.bDay}
                  onChange={set("bDay")}
                  isInvalid={!!errors.birthday && !a.bDay}
                >
                  <option value="">Day</option>
                  {Array.from({ length: daysIn(a.bMonth, a.bYear) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} sm={4}>
                <Form.Select
                  aria-label="Birth year"
                  value={a.bYear}
                  onChange={set("bYear")}
                  isInvalid={!!errors.birthday && !a.bYear}
                >
                  <option value="">Year</option>
                  {AUTH_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Err msg={errors.birthday} />
            {!errors.birthday && (
              <div className="field-hint">
                The authorized person must be at least 18 years old.
              </div>
            )}
          </Col>
        </Row>

        <div className="section-title my-4">
          Authorized Person's Contact and Other Information
        </div>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Label required>Relationship to Beneficiary</Label>
            <Form.Select
              value={a.relationship}
              onChange={set("relationship")}
              onBlur={blur("relationship")}
              isInvalid={!!errors.relationship}
            >
              <option value="">Select relationship</option>
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Form.Select>
            <Err msg={errors.relationship} />
            {!errors.relationship && (
              <div className="field-hint">
                The beneficiary is the student you are applying for.
              </div>
            )}
          </Col>
          <Col xs={12} md={6}>
            <Label required>PhilSys ID No.</Label>
            <Form.Control
              inputMode="numeric"
              value={a.philsys}
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
              value={a.occupation}
              onChange={(e) =>
                onChange("occupation", e.target.value.toUpperCase())
              }
              placeholder="Type None or leave it blank if you have no occupation"
            />
          </Col>
          <Col xs={12} md={6}>
            <Label required={hasOccupation(a.occupation)}>Monthly Salary</Label>
            <Form.Control
              inputMode="numeric"
              value={a.salary}
              onChange={digits("salary", 9)}
              onBlur={blur("salary")}
              isInvalid={!!errors.salary}
            />
            <Err msg={errors.salary} />
            {!errors.salary && hasOccupation(a.occupation) && (
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
              value={a.contact}
              onChange={digits("contact", 11)}
              onBlur={blur("contact")}
              placeholder="09XXXXXXXXX"
              maxLength={11}
              isInvalid={!!errors.contact}
              autoComplete="tel"
            />
            <Err msg={errors.contact} />
          </Col>
        </Row>
      </section>

      <section className="mb-4">
        <div className="section-title">Authorized Person's Address</div>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Label required>Municipality</Label>
            <Form.Select
              value={a.municipality}
              onChange={set("municipality")}
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
              value={a.barangay}
              onChange={set("barangay")}
              onBlur={blur("barangay")}
              disabled={!a.municipality}
              isInvalid={!!errors.barangay}
            >
              <option value="">
                {a.municipality
                  ? "Select barangay"
                  : "Select municipality first"}
              </option>
              {(BARANGAYS[a.municipality] || []).map((b) => (
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
              value={a.street}
              onChange={set("street")}
              autoComplete="street-address"
            />
          </Col>
        </Row>
      </section>
    </>
  );
}
