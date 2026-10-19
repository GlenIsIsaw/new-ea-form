import { Modal, Button } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";

const COUNTDOWN_SECONDS = 3;

// Security: prevent clickjacking via referrer/origin check at component level
function useAntiClickjack() {
  useEffect(() => {
    try {
      if (window.self !== window.top) {
        document.body.innerHTML = "";
        window.top.location = window.self.location;
      }
    } catch {
      document.body.innerHTML = "";
    }
  }, []);
}

export default function DataPrivacyModal({ show, onAccept }) {
  useAntiClickjack();

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [ready, setReady] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (show) {
      setCountdown(COUNTDOWN_SECONDS);
      setReady(false);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setReady(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [show]);

  return (
    <Modal
      show={show}
      size="lg"
      centered
      scrollable
      backdrop="static"
      keyboard={false}
      aria-labelledby="dpa-modal-title"
    >
      <Modal.Header className="consent-modal-header">
        <div>
          <Modal.Title id="dpa-modal-title" className="consent-modal-title">
            Data Privacy Notice
          </Modal.Title>
          <p className="consent-modal-subtitle">
            Republic Act No. 10173 — Data Privacy Act of 2012
          </p>
        </div>
      </Modal.Header>

      <Modal.Body className="consent-modal-body">
        <div className="consent-section">
          <h6 className="consent-section-heading">
            Purpose of Data Collection
          </h6>
          <p>
            The 2nd Legislative District of Camarines Norte collects your
            personal information solely for the administration of the{" "}
            <strong>Tulong Dunong Program (TDP)</strong> scholarship. Your data
            will not be used for any other purpose without your explicit
            consent.
          </p>
        </div>

        <div className="consent-section">
          <h6 className="consent-section-heading">Data We Collect</h6>
          <ul className="consent-list">
            <li>Full name, birthday, sex, and civil status</li>
            <li>Contact number, email address, and PhilSys ID number</li>
            <li>Occupation and monthly salary</li>
            <li>Home address (municipality, barangay, street/purok)</li>
          </ul>
        </div>

        <div className="consent-section">
          <h6 className="consent-section-heading">How Your Data Is Used</h6>
          <ul className="consent-list">
            <li>To verify your eligibility for the TDP scholarship</li>
            <li>To process and record your scholarship application</li>
            <li>To communicate with you regarding your application status</li>
            <li>To comply with government reporting requirements</li>
          </ul>
        </div>

        <div className="consent-section">
          <h6 className="consent-section-heading">Data Security</h6>
          <p>
            Your personal data is stored securely and access is limited to
            authorized personnel only. We implement appropriate technical and
            organizational measures to protect your information against
            unauthorized access, disclosure, or destruction.
          </p>
        </div>

        <div className="consent-section">
          <h6 className="consent-section-heading">Your Rights</h6>
          <p>
            Under R.A. 10173, you have the right to access, correct, and object
            to the processing of your personal data. For concerns, you may
            contact the office of the 2nd Legislative District of Camarines
            Norte.
          </p>
        </div>

        <div className="consent-section">
          <h6 className="consent-section-heading">Disclaimer</h6>
          <p className="consent-disclaimer-text">
            By proceeding with this application, you acknowledge that all
            information you provide is true and correct, and that your personal
            data will be collected, stored, and processed exclusively for the
            purpose of the Tulong Dunong Program. Misrepresentation of any
            information may result in disqualification.
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer className="consent-modal-footer">
        <div className="consent-footer-note">
          Please read the notice above before proceeding.
        </div>
        <Button
          className={`btn-consent ${ready ? "btn-consent-ready" : "btn-consent-waiting"}`}
          onClick={ready ? onAccept : undefined}
          disabled={!ready}
          aria-disabled={!ready}
        >
          {ready ? (
            <>I Understand &amp; Agree</>
          ) : (
            <>
              Please wait&nbsp;&nbsp;
              <span className="consent-countdown">{countdown}</span>
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
