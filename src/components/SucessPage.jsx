import { Container } from "react-bootstrap";

export default function SuccessPage({ onNewSubmission, secondsLeft }) {
  return (
    <div className="success-page-wrapper">
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="success-card">
          {/* Animated checkmark */}
          <div className="success-icon-wrap">
            <svg className="success-checkmark" viewBox="0 0 52 52">
              <circle
                className="success-checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="success-checkmark-check"
                fill="none"
                d="M14.1 27.2l7.1 7.2 16.7-16.8"
              />
            </svg>
          </div>

          <h2 className="success-title">Application Submitted!</h2>
          <br />
          <p className="success-message">
            Your information has been successfully recorded.
          </p>
          <br />
          <p className="success-message">
            Your application{" "}
            <strong className="text-uppercase">
              do not guarantee admission to the program
            </strong>
            . It shall undergo validation in accordance with existing
            guidelines.
          </p>

          {secondsLeft > 0 && (
            <p className="success-message mt-2">
              Redirecting you to our website in{" "}
              <strong>
                {secondsLeft} second{secondsLeft === 1 ? "" : "s"}
              </strong>
              ...
            </p>
          )}

          <div className="success-divider" />

          <button
            className="success-btn text-capitalize"
            onClick={onNewSubmission}
          >
            Thank you very much
          </button>
        </div>
      </Container>
    </div>
  );
}
