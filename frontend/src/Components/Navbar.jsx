import { Component } from 'react';
import { Button } from 'react-bootstrap';

import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

class NavbarComponent extends Component {
  constructor(props) {
    super(props);
  }

  logoutAction = () => {
    localStorage.removeItem('token');
    window.location.reload(); // do it
  };

  showInfo = () => {
    return (
      <Navbar.Text>
            Signed in as: <a onClick={this.logoutAction} href='#'>{this.props.userInformation.first_name} {this.props.userInformation.last_name}</a>
      </Navbar.Text>
    );
  };

  render() {
    return (
      <div>
        <Navbar>
          <Navbar.Brand href="/">Reservation System</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            { this.props.userInformation.username.length === 0 ? <></> : this.showInfo() }
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
}

export default NavbarComponent;
