const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uuid: String,
  first_name: String,
  last_name: String,
  username: String,
  password: String,
  token: String, // save token in database so we do not regenerate new one every single time.
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
