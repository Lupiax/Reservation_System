import { Component, createRef } from 'react';

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameRef: createRef(),
      passwordRef: createRef(),
      resultMessage: '',
    };
  }

  login = async () => {
    const result = await fetch('http://127.0.0.1:5000/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
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

    this.props.showMessageModal('Logged in!');
    this.props.hideLoginModal();
    this.props.setToken(result.token);
  };

  register = () => {
    this.props.showRegisterModal();
    this.props.hideLoginModal();
  };

  render() {
    return (
      <div>
        <Modal
          show={this.props.loginModalState}
          onHide={this.props.hideLoginModal}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title>Login</Modal.Title>
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
              <Form.Group className="mb-3" controlId="Form.username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="username"
                  ref={this.state.usernameRef}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="Form.password">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="password"
                  ref={this.state.passwordRef}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.login}>
              Login
            </Button>
            <Button variant="secondary" onClick={this.register}>
              Register
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default LoginModal;
