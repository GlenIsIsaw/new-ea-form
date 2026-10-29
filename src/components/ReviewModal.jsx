import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { MONTHS } from "../data/options";

const show_ = (value) =>
  value && String(value).trim() ? String(value).trim() : "-";

function InfoRow({ label, value }) {
  return (
    <Row className="review-row mb-1">
      <Col xs={5} sm={4}>
        <span className="review-label">{label}</span>
      </Col>
      <Col xs={7} sm={8}>
        <span className="review-value">{show_(value)}</span>
      </Col>
    </Row>
  );
}

function SectionHeader({ title }) {
  return <div className="review-section-header">{title}</div>;
}

// `data` is the review object built in App.jsx (birthday and salary already formatted)
export default function ReviewModal({
  show,
  onHide,
  data,
  onConfirm,
  family = [],
  auth = null,
  studentSameAsAuth = false,
}) {
  const sp = auth ? "Student - " : "";
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (show) setAgreed(false);
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable centered>
      <Modal.Header closeButton className="review-modal-header">
        <Modal.Title className="review-modal-title">
          Review Your Information
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="review-modal-body">
        {auth && (
          <>
            <SectionHeader title="Authorized Person" />
            <div className="review-section-body">
              <InfoRow label="Relationship" value={auth.relationship} />
              <InfoRow label="Last Name" value={auth.lastName} />
              <InfoRow label="First Name" value={auth.firstName} />
              <InfoRow label="Middle Name" value={auth.middleName} />
              <InfoRow label="Extension" value={auth.extension} />
              <InfoRow label="Gender" value={auth.sex} />
              <InfoRow label="Civil Status" value={auth.civilStatus} />
              <InfoRow
                label="Birthday"
                value={
                  auth.bMonth && auth.bDay && auth.bYear
                    ? `${MONTHS[auth.bMonth - 1]} ${auth.bDay}, ${auth.bYear}`
                    : ""
                }
              />
              <InfoRow label="PhilSys ID No." value={auth.philsys} />
              <InfoRow label="Contact Number" value={auth.contact} />
              <InfoRow label="Occupation" value={auth.occupation} />
              <InfoRow
                label="Monthly Salary"
                value={
                  auth.salary
                    ? `₱${Number(auth.salary).toLocaleString("en-PH")}`
                    : ""
                }
              />
              <InfoRow label="Municipality" value={auth.municipality} />
              <InfoRow label="Barangay" value={auth.barangay} />
              <InfoRow label="Purok / Street" value={auth.street} />
            </div>
          </>
        )}

        <SectionHeader title={`${sp}Full Name`} />
        <div className="review-section-body">
          <InfoRow label="Last Name" value={data.lastName} />
          <InfoRow label="First Name" value={data.firstName} />
          <InfoRow label="Middle Name" value={data.middleName} />
          <InfoRow label="Extension" value={data.extension} />
        </div>

        <SectionHeader title={`${sp}Personal Information`} />
        <div className="review-section-body">
          <InfoRow label="Sex" value={data.sex} />
          <InfoRow label="Civil Status" value={data.civilStatus} />
          <InfoRow label="School / University" value={data.school} />
          <InfoRow label="Year Level" value={data.yearLevel} />
          <InfoRow label="Birthday" value={data.birthday} />
        </div>

        <SectionHeader title={`${sp}Contact and Other Information`} />
        <div className="review-section-body">
          <InfoRow label="PhilSys ID No." value={data.philsys} />
          <InfoRow label="Occupation" value={data.occupation} />
          <InfoRow label="Monthly Salary" value={data.salary} />
          <InfoRow label="Contact Number" value={data.contact} />
          <InfoRow label="Email" value={data.email} />
        </div>

        <SectionHeader title={`${sp}Address`} />
        <div className="review-section-body">
          {auth && (
            <InfoRow
              label="Address"
              value={
                studentSameAsAuth
                  ? "SAME AS AUTHORIZED PERSON"
                  : "DIFFERENT ADDRESS"
              }
            />
          )}
          <InfoRow label="Municipality" value={data.municipality} />
          <InfoRow label="Barangay" value={data.barangay} />
          <InfoRow label="Purok / Street" value={data.street} />
        </div>

        {family.map((m, i) => (
          <div key={i}>
            <SectionHeader title={`Family Member ${i + 1}`} />
            <div className="review-section-body">
              <InfoRow label="Relationship" value={m.relationship} />
              <InfoRow label="Last Name" value={m.lastName} />
              <InfoRow label="First Name" value={m.firstName} />
              <InfoRow label="Middle Name" value={m.middleName} />
              <InfoRow label="Extension" value={m.extension} />
              <InfoRow label="Gender" value={m.sex} />
              <InfoRow label="Civil Status" value={m.civilStatus} />
              <InfoRow
                label="Birthday"
                value={
                  m.bMonth && m.bDay && m.bYear
                    ? `${MONTHS[m.bMonth - 1]} ${m.bDay}, ${m.bYear}`
                    : ""
                }
              />
              <InfoRow label="Contact Number" value={m.contact} />
              <InfoRow label="Occupation" value={m.occupation} />
              <InfoRow
                label="Monthly Salary"
                value={
                  m.salary ? `₱${Number(m.salary).toLocaleString("en-PH")}` : ""
                }
              />
              <InfoRow
                label="Address"
                value={m.sameAddress ? "SAME AS STUDENT" : "DIFFERENT ADDRESS"}
              />
              <InfoRow label="Municipality" value={m.municipality} />
              <InfoRow label="Barangay" value={m.barangay} />
              <InfoRow label="Purok / Street" value={m.street} />
            </div>
          </div>
        ))}
      </Modal.Body>

      {/* Acknowledgement: outside the scrollable body, anchored above the footer */}
      <div
        className={`review-acknowledgement ${agreed ? "review-ack-done" : "review-ack-pending"}`}
      >
        <label htmlFor="confirmInformation" className="review-ack-inner">
          <Form.Check
            id="confirmInformation"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="review-ack-check"
          />
          <span className="review-ack-text">
            I confirm that the information above is true and correct. I consent
            to the use of my personal data solely for the TDP Application and
            acknowledge that I am responsible for the accuracy of the
            information I submitted.
          </span>
        </label>
      </div>

      <Modal.Footer className="review-modal-footer">
        <Button
          variant="outline-secondary"
          className="btn-go-back"
          onClick={onHide}
        >
          Go Back
        </Button>
        <Button
          className="btn-submit"
          onClick={onConfirm}
          disabled={!agreed}
          title={!agreed ? "Please confirm the information above first" : ""}
        >
          Proceed to Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
