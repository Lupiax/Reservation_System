import { Component, createRef } from 'react';

import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { reservationContext } from '../../Contexts/ReservationContext';

class ReservationModal extends Component {
  static contextType = reservationContext;

  constructor(props) {
    super(props);
    this.state = {
      roomSelection: createRef(),
      resultMessage: '',
    };
  }

  reserve = async () => {

    const date = new Date(this.props.start - this.props.end);

    // some client sided checks...
    if (date.getHours() > 2)
      return this.props.showMessageModal('You cannot reserve more than two hours.');

    const result = await fetch('http://127.0.0.1:5000/reservation/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        start: this.props.start,
        end: this.props.end,
        room: this.state.roomSelection.current.value,
      }),
    }).then(result => result.json());

    if (!result.status) {
      this.props.showMessageModal(result.message);
      return this.props.hideReservationModal();
    }

    if (result.update) {
      // disgusting, needs refactoring.
      let items = [...this.context.reservations];
      let index = items.findIndex(
        x =>
          x.start.getDate() === new Date(result.reservation.start).getDate() &&
          x.uuid === result.reservation.uuid
      );
      let item = { ...items[index] };
      item.start = new Date(result.reservation.start);
      item.end = new Date(result.reservation.end);
      items[index] = item;
      this.context.setReservations(items);
    } else {
      this.context.setReservations([
        ...this.context.reservations,
        {
          start: new Date(result.reservation.start),
          end: new Date(result.reservation.end),
          title: result.reservation.title,
          uuid: result.reservation.uuid,
        },
      ]);
    }

    this.props.showMessageModal(result.message);
    this.props.hideReservationModal();
  };

  render() {
    return (
      <div>
        <Modal
          show={this.props.reservationModalState}
          onHide={this.props.hideReservationModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>Reservation</Modal.Title>
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
                <Form.Select aria-label="Select room to reserve" ref={this.state.roomSelection}>
                  <option>Select room to reserve</option>
                  <option value="1">Room #1</option>
                  <option value="2">Room #2</option>
              </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.hideReservationModal}>
              Close
            </Button>
            <Button variant="primary" onClick={this.reserve}>
              Reserve
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ReservationModal;
