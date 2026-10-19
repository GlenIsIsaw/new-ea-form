import { Modal, Button } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";

const COUNTDOWN_SECONDS = 3;

// EDIT the rules below to match your real instructions.
const RULES = [
  { title: "Fill out all required fields", body: "Every field marked with a red asterisk (*) must be completed." },
  { title: "Write your full middle name", body: "Do not use initials or periods. Leave it blank if you have no middle name." },
  { title: "Check your numbers", body: "Your contact number must be 11 digits and start with 09. Your PhilSys ID number must be exactly 16 digits." },
  { title: "Use a valid email address", body: "Use an email address that you can access, because we may contact you through it." },
  { title: "Review before submitting", body: "After clicking Review Form, check every entry, tick the confirmation box, then submit. You cannot edit your information after submission." },
];

export default function InstructionModal({ show, onAccept }) {
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
    <Modal show={show} size="lg" centered scrollable backdrop="static" keyboard={false} aria-labelledby="instruction-modal-title">
      <Modal.Header className="consent-modal-header">
        <div>
          <Modal.Title id="instruction-modal-title" className="consent-modal-title">Instructions</Modal.Title>
          <p className="consent-modal-subtitle">Please read before filling out the form</p>
        </div>
      </Modal.Header>

      <Modal.Body className="consent-modal-body">
        <p className="consent-rules-intro">
          Follow these steps so your application can be processed without delay.
        </p>
        <div className="consent-rules-list">
          {RULES.map((r, i) => (
            <div className="consent-rule-item" key={r.title}>
              <div className="consent-rule-number">{i + 1}</div>
              <div className="consent-rule-content">
                <p className="consent-rule-title">{r.title}</p>
                <p className="consent-rule-body">{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer className="consent-modal-footer">
        <div className="consent-footer-note">Please read the instructions above before proceeding.</div>
        <Button
          className={`btn-consent ${ready ? "btn-consent-ready" : "btn-consent-waiting"}`}
          onClick={ready ? onAccept : undefined}
          disabled={!ready}
          aria-disabled={!ready}
        >
          {ready ? <>I Understand &amp; Continue</> : <>Please wait&nbsp;&nbsp;<span className="consent-countdown">{countdown}</span></>}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}