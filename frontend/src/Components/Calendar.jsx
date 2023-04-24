import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../hack.css';

import { Component } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { areIntervalsOverlapping } from 'date-fns';

import { reservationContext } from '../Contexts/ReservationContext';

class Calendar extends Component {
  static contextType = reservationContext;

  constructor(props) {
    super(props);
  }

  fetchReservations = async () => {
    const result = await fetch('http://127.0.0.1:5000/reservation/list', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${this.props.token}`,
      },
    }).then(result => result.json());

    if (!result.status) {
      localStorage.removeItem('token'); // expired.
      return this.props.showMessageModal(result.message);
    }

    const converted_reservations = result.reservations.map(reservation => ({
      start: new Date(reservation.start),
      end: new Date(reservation.end),
      title: reservation.title,
      uuid: reservation.uuid,
    }));

    this.context.setReservations(converted_reservations);
  };

  postReservation = async (start, end) => {

    const date = new Date(start - end);

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
        start: start,
        end: end,
      }),
    }).then(result => result.json());

    if (!result.status) {
      return this.props.showMessageModal(result.message);
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
    }
    
    this.props.showMessageModal(result.message);
  };

  // I did not know this can be async too...
  async componentDidMount() {
    if (this.props.token === null) return this.props.showLoginModal();

    await this.fetchReservations();
  }

  // This saved my whole project...
  async componentDidUpdate() {
    if (this.context.reservations.length !== 0 || this.props.token === null)
      return;

    await this.fetchReservations();
  }

  editReservation = async event => {
    this.props.showInformationModal({
      start: event.start,
      end: event.end,
      title: event.title,
      uuid: event.uuid,
    });
  };

  addReservation = async ({ start, end }) => {

    let overlap = false;
    this.context.reservations.forEach((reservation) => {

      const isOverlapping = areIntervalsOverlapping(
        { start: new Date(reservation.start), end: new Date(reservation.end) },
        { start: new Date(start), end: new Date(end) }
      );

      if (isOverlapping)
        overlap = true;

    })

    if (overlap)
      return this.postReservation(start, end); // don't show dialog if we're overlapping.
    this.props.showReservationModal(start, end);
  };

  render() {
    return (
      <>
        <BigCalendar
          selectable
          formats={{
            /* 24-hour format */
            timeGutterFormat: (date, culture, localizer) =>
              localizer.format(date, 'HH:mm', culture),
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              localizer.format(start, 'HH:mm', culture) +
              ' - ' +
              localizer.format(end, 'HH:mm', culture),
          }}
          localizer={momentLocalizer(moment)}
          views={['work_week']}
          defaultView="work_week"
          events={this.context.reservations}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '94vh' }}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 16, 0, 0)}
          onSelectEvent={this.editReservation}
          onSelectSlot={this.addReservation}
        />
      </>
    );
  }
}

export default Calendar;
