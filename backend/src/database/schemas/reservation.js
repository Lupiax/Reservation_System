const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  start: Date,
  end: Date,
  title: String,
  uuid: String /* the userId of the person who reserved the time. */,
});

const reservationModel = mongoose.model('reservations', reservationSchema);

module.exports = reservationModel;
