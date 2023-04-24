const Router = require("express").Router();

const Reservation = require("../database/schemas/reservation");
const datefns = require("date-fns");
const { responseStatus } = require("../utils/response_utils");
const { jwtAuthentication } = require("../utils/jwt_utils");
const jwt = require("jsonwebtoken");

Router.post("/add", jwtAuthentication, async (req, res) => {
  const reservation = await Reservation.find({
    start: req.body.start,
    end: req.body.end,
  });

  // Oh...
  if (reservation.length !== 0) {
    return responseStatus(res, 200, false, {
      message:
        "It seems that someone else has reserved this time, so you are unable to reserve it during this time.",
    });
  }

  const date = new Date(req.body.start - req.body.end);

  // Let's do the same check on server side we can't trust the client anyways...
  if (date.getHours() > 2) {
    return responseStatus(res, 200, false, {
      message: "You can only reserve 2 hours at once.",
    });
  }

  // Oh you know what? Yeah... this is completely broken and unusable for now... TODO!!! fix
  /*
  function dostuffhere(date) {
    var year = new Date(date.getFullYear(), 0, 1);
    var days = Math.floor((date - year) / (24 * 60 * 60 * 1000));
    var week = Math.ceil(( date.getDay() + 1 + days) / 7);
    return week;
  }

  if (
    dostuffhere(new Date(req.body.start)) < dostuffhere(new Date())
  )
    return responseStatus(res, 200, false, {
      message: 'You cannot reserve in the past.',
    });
  */

  for await (const reservation of Reservation.find()) {
    /* this is to prevent nasty overlapping behaviour */
    const isOverlapping = datefns.areIntervalsOverlapping(
      { start: new Date(reservation.start), end: new Date(reservation.end) },
      { start: new Date(req.body.start), end: new Date(req.body.end) }
    );

    if (isOverlapping) {
      if (
        req.user.uuid === reservation.uuid &&
        new Date(req.body.start).getDate() ==
          new Date(reservation.start).getDate()
      ) {
        const document = await Reservation.updateOne(
          {
            start: reservation.start,
            end: reservation.end,
          },
          {
            start: req.body.start,
            end: req.body.end,
          }
        );

        if (document !== null)
          return responseStatus(res, 200, true, {
            message: "Your reservation has been updated.",
            update: true, // if this is true we do some different logic.
            reservation: {
              /* update only has new date */
              start: req.body.start,
              end: req.body.end,
              uuid: req.user.uuid,
            },
          });
      }

      return responseStatus(res, 200, false, {
        message: "You cannot overlap reservations, that would cause chaos..",
      });
    }

    if (
      reservation.uuid === req.user.uuid &&
      new Date(req.body.start).getDate() ==
        new Date(reservation.start).getDate()
    ) {
      return responseStatus(res, 200, false, {
        message: "You can only reserve once per day.",
      });
    }
  }

  const room = req.body.room?.trim() || "";

  // it works so I got nothing to complain.
  if (room.length != 1) {
    return responseStatus(res, 200, false, {
      message: "You must select a room to reserve.",
    });
  }

  const document = await Reservation.create({
    start: req.body.start,
    end: req.body.end,
    title: `${req.user.first_name} ${req.user.last_name} (huone #${room})`, // TODO: do not trust the user blindly.
    uuid: req.user.uuid,
  });

  if (document != null) {
    return responseStatus(res, 200, true, {
      message: "Your reservation has been made.",
      update: false,
      reservation: {
        start: document.start,
        end: document.end,
        title: document.title,
        uuid: document.uuid,
      },
    });
  }

  return responseStatus(res, 500, false, {
    message:
      "Internal error 500, the server experienced unexpected error, the system administrators have been notified.",
  });
});

Router.delete("/remove", jwtAuthentication, async (req, res) => {
  const reservation = await Reservation.findOne({
    start: req.body.start,
    end: req.body.end,
  });

  if (reservation.length === null) {
    return responseStatus(res, 200, false, {
      message: "I am not sure what happended here.",
    });
  }

  if (reservation.uuid !== req.user.uuid) {
    return responseStatus(res, 200, false, {
      message: "You cannot delete someone elses reservation.",
    });
  }

  const query = await Reservation.deleteOne({
    start: req.body.start,
    end: req.body.end,
  });

  if (query.deletedCount !== 0) {
    return responseStatus(res, 200, true, {
      message: "Reservation has been deleted.",
    });
  }

  return responseStatus(res, 500, false, {
    message:
      "Internal error 500, the server experienced unexpected error, the system administrators have been notified.",
  });
});

/* list of current schedules in the database. */
Router.get("/list", jwtAuthentication, async (req, res) => {
  let result = [];
  for await (const reservation of Reservation.find()) result.push(reservation);
  return responseStatus(res, 200, true, { reservations: result });
});

module.exports = Router;
