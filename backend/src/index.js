require('dotenv').config(); // load .env

const mongoose = require('mongoose');

const cors = require('cors')();
const json = require('express').json();

const app = require('express')();

mongoose.connect('mongodb://127.0.0.1:27017/ressys'); // go go!

app.use(cors);
app.use(json);

const reservationRouter = require('./routers/reservation');
const userRouter = require('./routers/user');

app.use('/reservation', reservationRouter);
app.use('/user', userRouter);

app.listen(process.env.PORT, () => {
  console.log(`Started backend at http://127.0.0.1:${process.env.PORT}/`);
});
