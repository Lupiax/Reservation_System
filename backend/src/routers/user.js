const Router = require('express').Router();

const User = require('../database/schemas/user');
const Crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { responseStatus } = require('../utils/response_utils');
const { v4: uuidv4 } = require('uuid');

// TODO: we should put this into it's own wrapper function.
function jwtAuthentication(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
    // TODO: if the error is "token" expired, please regenerate the token.
    if (err)
      return responseStatus(res, 403, false, {
        message: 'The given authorization token was invalid.',
      });

    req.user = user;

    next();
  });
}

Router.post('/create', async (req, res) => {
  if (
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.username ||
    !req.body.password
  )
    return responseStatus(res, 400, false, {
      message: 'Every field must be fulfilled for the request to be valid.',
    });

  const user = await User.find({ username: req.body.username.toLowerCase() });

  if (user.length !== 0)
    return responseStatus(res, 200, false, {
      message: 'Account exists with this name.',
    });

  if (
    req.body.username.trim().length > 24 ||
    req.body.username.trim().length < 3
  )
    return responseStatus(res, 200, false, {
      message: 'Username must be between 3-24 characters.',
    });

  if (
    req.body.password.trim().length > 32 ||
    req.body.password.trim().length < 3
  )
    // frankly I could add no limit to password since its hashed anyways but...
    return responseStatus(res, 200, false, {
      message: 'Password must be between 3-24 characters.',
    });

  if (
    req.body.first_name.trim().length > 32 ||
    req.body.first_name.trim().length < 3
  )
    return responseStatus(res, 200, false, {
      message: 'First name must be between 3-32 characters.',
    });

  if (
    req.body.last_name.trim().length > 32 ||
    req.body.last_name.trim().length < 3
  )
    // frankly I could add no limit to password since its hashed anyways but...
    return responseStatus(res, 200, false, {
      message: 'Last name must be between 3-32 characters.',
    });

  const uuid = uuidv4();

  const document = await User.create({
    uuid: uuid, // the chance of this overlapping is so small that I honestly don't bother check it.
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    username: req.body.username.toLowerCase(),
    password: Crypto.createHash('sha256')
      .update(req.body.password)
      .digest()
      .toString('hex'),
    token: jwt.sign(
      {
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        uuid: uuid,
      },
      process.env.SECRET_TOKEN,
      { expiresIn: '365d' }
    ),
  });

  if (document != null)
    return responseStatus(res, 200, true, { token: document.token });

  return responseStatus(res, 500, false, {
    message:
      'Internal error 500, the server experienced unexpected error, the system administrators have been notified.',
  });
});

Router.post('/login', async (req, res) => {
  const user = await User.findOne({
    username: req.body.username.toLowerCase(),
    password: Crypto.createHash('sha256')
      .update(req.body.password)
      .digest()
      .toString('hex'),
  });

  if (user !== null)
    return responseStatus(res, 200, true, { token: user.token });
  else
    return responseStatus(res, 200, false, {
      message: 'Wrong password or username.',
    });
});

// I stole this from discord, thanks.
Router.get('/@me', jwtAuthentication, (req, res) => {
  // return the JWT token information.
  return responseStatus(res, 200, true, {
    username: req.user.username,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    uuid: req.user.uuid,
  });
});

module.exports = Router;
