import { Row, Col, Form } from "react-bootstrap";
import { MONTHS, EXTENSIONS, SEX, CIVIL, daysIn } from "../data/options";
import { RELATIONSHIPS, FAMILY_YEARS, hasOccupation } from "../data/family";
import { MUNICIPALITIES, BARANGAYS } from "../data/locations";

const Err = ({ msg }) =>
  msg ? (
    <Form.Control.Feedback type="invalid" className="d-block">
      {msg}
    </Form.Control.Feedback>
  ) : null;

const Label = ({ children, required, optional }) => (
  <Form.Label className="form-label">
    {children}
    {required && <span className="required">*</span>}
    {optional && <span className="family-optional"></span>}
  </Form.Label>
);

export default function FamilyMemberCard({
  index,
  member: m,
  errors = {},
  onChange,
  onBlurField,
  onRemove,
  onSameAddress,
  canRemove,
}) {
  const hasErrors = Object.values(errors).some(Boolean);
  const set = (name) => (e) => onChange(name, e.target.value);
  const nameSet = (name) => (e) =>
    onChange(name, e.target.value.normalize("NFC").toUpperCase());
  const digits = (name, max) => (e) =>
    onChange(name, e.target.value.replace(/\D/g, "").slice(0, max));
  const blur = (name) => () => onBlurField(name);

  return (
    <div
      className={`family-card ${hasErrors ? "has-error" : ""}`}
      id={`family-${index}`}
    >
      <div className="family-card-header">
        <div className="family-card-title">
          <span className="family-badge">{index + 1}</span>
          Family Member {index + 1}
        </div>
        {canRemove && (
          <button
            type="button"
            className="family-remove"
            onClick={onRemove}
            aria-label={`Remove family member ${index + 1}`}
          >
            Remove
          </button>
        )}
      </div>

      <div className="family-card-body">
        <div className="family-sub">Relationship</div>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Label required>Relationship to Beneficiary</Label>
            <Form.Select
              value={m.relationship}
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
                The beneficiary is the student who is applying.
              </div>
            )}
          </Col>
        </Row>

        <div className="family-sub">Full Name</div>
        <Row className="g-3">
          <Col xs={12} md={6} lg={3}>
            <Label required>Last Name</Label>
            <Form.Control
              value={m.lastName}
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
              value={m.firstName}
              onChange={nameSet("firstName")}
              onBlur={blur("firstName")}
              isInvalid={!!errors.firstName}
              autoComplete="off"
            />
            <Err msg={errors.firstName} />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Label optional>Middle Name</Label>
            <Form.Control
              value={m.middleName}
              onChange={nameSet("middleName")}
              onBlur={blur("middleName")}
              isInvalid={!!errors.middleName}
              autoComplete="off"
            />
            <Err msg={errors.middleName} />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Label optional>Extension Name</Label>
            <Form.Select value={m.extension} onChange={set("extension")}>
              <option value="">None</option>
              {EXTENSIONS.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <div className="family-sub">Personal Information</div>
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Label required>Gender</Label>
            <Form.Select
              value={m.sex}
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
              value={m.civilStatus}
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
                  value={m.bMonth}
                  onChange={set("bMonth")}
                  isInvalid={!!errors.birthday && !m.bMonth}
                >
                  <option value="">Month</option>
                  {MONTHS.map((mo, i) => (
                    <option key={mo} value={i + 1}>
                      {mo}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} sm={3}>
                <Form.Select
                  aria-label="Birth day"
                  value={m.bDay}
                  onChange={set("bDay")}
                  isInvalid={!!errors.birthday && !m.bDay}
                >
                  <option value="">Day</option>
                  {Array.from({ length: daysIn(m.bMonth, m.bYear) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} sm={4}>
                <Form.Select
                  aria-label="Birth year"
                  value={m.bYear}
                  onChange={set("bYear")}
                  isInvalid={!!errors.birthday && !m.bYear}
                >
                  <option value="">Year</option>
                  {FAMILY_YEARS.map((y) => (
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

        <div className="family-sub">Contact and Work</div>
        <Row className="g-3">
          <Col xs={12} md={4}>
            <Label optional>Contact Number</Label>
            <Form.Control
              type="tel"
              inputMode="numeric"
              value={m.contact}
              onChange={digits("contact", 11)}
              onBlur={blur("contact")}
              placeholder="09XXXXXXXXX"
              maxLength={11}
              isInvalid={!!errors.contact}
            />
            <Err msg={errors.contact} />
          </Col>
          <Col xs={12} md={4}>
            <Label optional>Occupation</Label>
            <Form.Control
              value={m.occupation}
              onChange={(e) =>
                onChange("occupation", e.target.value.toUpperCase())
              }
              placeholder="Type None if no occupation"
            />
          </Col>
          <Col xs={12} md={4}>
            <Label
              required={hasOccupation(m.occupation)}
              optional={!hasOccupation(m.occupation)}
            >
              Monthly Salary
            </Label>
            <Form.Control
              inputMode="numeric"
              value={m.salary}
              onChange={digits("salary", 9)}
              onBlur={blur("salary")}
              isInvalid={!!errors.salary}
              placeholder="Numbers only"
            />
            <Err msg={errors.salary} />
          </Col>
        </Row>

        <div className="family-sub">Address</div>
        <Form.Check
          type="checkbox"
          id={`same-address-${index}`}
          className="family-same"
          checked={!!m.sameAddress}
          onChange={(e) => onSameAddress(e.target.checked)}
          label="Same address as the student"
        />
        {m.sameAddress && (
          <div className="field-hint family-same-hint">
            Using the student's address from above. It updates automatically if
            the student's address changes.
          </div>
        )}
        <Row className="g-3 mt-2">
          <Col xs={12} md={6}>
            <Label required={!m.sameAddress}>Municipality</Label>
            <Form.Select
              value={m.municipality}
              onChange={set("municipality")}
              onBlur={blur("municipality")}
              disabled={!!m.sameAddress}
              isInvalid={!!errors.municipality}
            >
              <option value="">
                {m.sameAddress
                  ? "Fill in the student's address above"
                  : "Select municipality"}
              </option>
              {MUNICIPALITIES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Form.Select>
            <Err msg={errors.municipality} />
          </Col>
          <Col xs={12} md={6}>
            <Label required={!m.sameAddress}>Barangay</Label>
            <Form.Select
              value={m.barangay}
              onChange={set("barangay")}
              onBlur={blur("barangay")}
              disabled={!!m.sameAddress || !m.municipality}
              isInvalid={!!errors.barangay}
            >
              <option value="">
                {m.municipality
                  ? "Select barangay"
                  : "Select municipality first"}
              </option>
              {(BARANGAYS[m.municipality] || []).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Form.Select>
            <Err msg={errors.barangay} />
          </Col>
          <Col xs={12}>
            <Label optional>Street / Purok</Label>
            <Form.Control
              value={m.street}
              onChange={set("street")}
              disabled={!!m.sameAddress}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
}
