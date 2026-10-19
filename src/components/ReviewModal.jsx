import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { useState, useEffect } from "react";

const show_ = (value) => (value && String(value).trim() ? String(value).trim() : "-");

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
export default function ReviewModal({ show, onHide, data, onConfirm }) {
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (show) setAgreed(false);
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} size="lg" scrollable centered>
      <Modal.Header closeButton className="review-modal-header">
        <Modal.Title className="review-modal-title">Review Your Information</Modal.Title>
      </Modal.Header>

      <Modal.Body className="review-modal-body">
        <SectionHeader title="Full Name" />
        <div className="review-section-body">
          <InfoRow label="Last Name" value={data.lastName} />
          <InfoRow label="First Name" value={data.firstName} />
          <InfoRow label="Middle Name" value={data.middleName} />
          <InfoRow label="Extension" value={data.extension} />
        </div>

        <SectionHeader title="Personal Information" />
        <div className="review-section-body">
          <InfoRow label="Sex" value={data.sex} />
          <InfoRow label="Civil Status" value={data.civilStatus} />
          <InfoRow label="Birthday" value={data.birthday} />
        </div>

        <SectionHeader title="Contact and Other Information" />
        <div className="review-section-body">
          <InfoRow label="PhilSys ID No." value={data.philsys} />
          <InfoRow label="Occupation" value={data.occupation} />
          <InfoRow label="Monthly Salary" value={data.salary} />
          <InfoRow label="Contact Number" value={data.contact} />
          <InfoRow label="Email" value={data.email} />
        </div>

        <SectionHeader title="Address" />
        <div className="review-section-body">
          <InfoRow label="Municipality" value={data.municipality} />
          <InfoRow label="Barangay" value={data.barangay} />
          <InfoRow label="Purok / Street" value={data.street} />
        </div>
      </Modal.Body>

      {/* Acknowledgement: outside the scrollable body, anchored above the footer */}
      <div className={`review-acknowledgement ${agreed ? "review-ack-done" : "review-ack-pending"}`}>
        <label htmlFor="confirmInformation" className="review-ack-inner">
          <Form.Check
            id="confirmInformation"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="review-ack-check"
          />
          <span className="review-ack-text">
            I confirm that the information above is true and correct. I consent to the use of my personal data
            solely for the TDP Application and acknowledge that I am responsible for the accuracy of the
            information I submitted.
          </span>
        </label>
      </div>

      <Modal.Footer className="review-modal-footer">
        <Button variant="outline-secondary" className="btn-go-back" onClick={onHide}>
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