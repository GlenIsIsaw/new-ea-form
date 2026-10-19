import { Modal, Button } from "react-bootstrap";

export default function ConfirmationModal({
  show,
  onHide,
  onConfirm,
  title,
  message,
  subMessage,
  confirmText = "Yes",
  cancelText = "No",
  confirmVariant = "primary",
}) {
  const isDanger = confirmVariant === "danger";

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="sm">
      <Modal.Header closeButton className="confirm-modal-header">
        <Modal.Title className="confirm-modal-title">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="confirm-modal-body">
        <p className="confirm-message">{message}</p>
        {subMessage && <p className="confirm-sub-message">{subMessage}</p>}
      </Modal.Body>

      <Modal.Footer className="confirm-modal-footer">
        <Button className="btn-go-back" variant="outline-secondary" onClick={onHide}>
          {cancelText}
        </Button>
        <Button className={isDanger ? "btn-confirm-danger" : "btn-submit"} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}