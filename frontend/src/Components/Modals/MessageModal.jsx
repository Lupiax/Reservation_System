import { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

class MessageModal extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Modal
          show={this.props.messageModalState}
          onHide={this.props.hideMessageModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>{this.props.messageModalMessage}</h5>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.hideMessageModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default MessageModal;
