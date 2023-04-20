import { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { reservationContext } from '../../Contexts/ReservationContext';

class InformationModal extends Component {
  static contextType = reservationContext;

  constructor(props) {
    super(props);
  }

  deleteReservation = async (start, end) => {
    const result = await fetch('http://127.0.0.1:5000/reservation/remove', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        start: start,
        end: end,
      }),
    }).then(result => result.json());

    if (!result.status) return this.props.showMessageModal(result.message);

    this.context.setReservations(
      this.context.reservations.filter(event => {
        return event.start !== start && event.end !== end;
      })
    );

    this.props.hideInformationModal();
    this.props.showMessageModal(result.message);
  };

  render() {
    return (
      <div>
        <Modal
          show={this.props.informationModalState}
          onHide={this.props.hideInformationModal}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.informationModalReservation.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>
              Start - {this.props.informationModalReservation.start.toString()}
            </h5>
            <br />
            <h5>
              End - {this.props.informationModalReservation.end.toString()}
            </h5>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={this.props.hideInformationModal}
            >
              Close
            </Button>
            {this.props.informationModalReservation.uuid ==
            this.props.userInformation.uuid ? (
              <Button
                variant="danger"
                onClick={() => {
                  this.deleteReservation(
                    this.props.informationModalReservation.start,
                    this.props.informationModalReservation.end
                  );
                }}
              >
                Delete
              </Button>
            ) : (
              <></>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default InformationModal;
