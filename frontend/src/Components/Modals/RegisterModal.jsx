import { Component, createRef } from 'react';

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

class RegisterModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstNameRef: createRef(),
      lastNameRef: createRef(),
      usernameRef: createRef(),
      passwordRef: createRef(),
      resultMessage: '',
    };
  }

  register = async () => {
    const result = await fetch('http://127.0.0.1:5000/user/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: this.state.firstNameRef.current.value,
        last_name: this.state.lastNameRef.current.value,
        username: this.state.usernameRef.current.value,
        password: this.state.passwordRef.current.value,
      }),
    }).then(result => result.json());

    if (!result.status) {
      this.setState({ resultMessage: result.message });
      setTimeout(() => {
        this.setState({ resultMessage: '' });
      }, 1000); // remove alert after 1 seconds.
      return;
    }

    this.props.showMessageModal('Registered!');
    this.props.hideRegisterModal();
    this.props.setToken(result.token);
  };

  login = () => {
    this.props.hideRegisterModal();
    this.props.showLoginModal();
  };

  render() {
    return (
      <div>
        <Modal
          show={this.props.registerModalState}
          onHide={this.props.hideRegisterModal}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-2 mt-2">
              {this.state.resultMessage !== '' ? (
                <Alert key="info" variant="danger">
                  {this.state.resultMessage}
                </Alert>
              ) : (
                ''
              )}
            </div>
            <Form>
              <Form.Group className="mb-3" controlId="Form.firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  ref={this.state.firstNameRef}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="Form.lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  ref={this.state.lastNameRef}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="Form.username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Username"
                  ref={this.state.usernameRef}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="Form.password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  ref={this.state.passwordRef}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.login}>
              Go Back
            </Button>
            <Button variant="primary" onClick={this.register}>
              Register
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default RegisterModal;
