const Router = require("express").Router();

const User = require("../database/schemas/user");
const Crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { responseStatus } = require("../utils/response_utils");
const { jwtAuthentication } = require("../utils/jwt_utils");
const { v4: uuidv4 } = require("uuid");

Router.post("/create", async (req, res) => {
  if (
    !req.body.first_name ||
    !req.body.last_name ||
    !req.body.username ||
    !req.body.password
  ) {
    return responseStatus(res, 400, false, {
      message: "Every field must be fulfilled for the request to be valid.",
    });
  }

  // Let's not repeat the same stuff for hundred times...
  const first_name = req.body.first_name?.trim() || "";
  const last_name = req.body?.last_name || "";
  const username = req.body.username?.toLowerCase()?.trim() || ""; 
  const password = req.body.password?.trim() || "";

  if (
    username.length > 24 ||
    username.length < 3
  ) {
    return responseStatus(res, 200, false, {
      message: "Username must be between 3-24 characters.",
    });
  }

  if (
    password.length > 32 ||
    password.length < 3
  ) {
    // frankly I could add no limit to password since its hashed anyways but...
    return responseStatus(res, 200, false, {
      message: "Password must be between 3-24 characters.",
    });
  }

  if (
    first_name.length > 32 ||
    first_name.length < 3
  ) {
    return responseStatus(res, 200, false, {
      message: "First name must be between 3-32 characters.",
    });
  }

  if (
    last_name.length > 32 ||
    last_name.length < 3
  ) {
    return responseStatus(res, 200, false, {
      message: "Last name must be between 3-32 characters.",
    });
  }

  const user = await User.findOne({ username: username });

  if (user !== null) {
    return responseStatus(res, 200, false, {
      message: "Account exists with this name.",
    });
  }

  const uuid = uuidv4();

  const document = await User.create({
    uuid: uuid,
    first_name: first_name,
    last_name: last_name,
    username: username,
    /*  TODO! use bcrypt instead, which is probably smarter since it also supports password salting. */
    password: Crypto.createHash("sha256")
      .update(password)
      .digest()
      .toString("hex"),
    token: jwt.sign(
      {
        username: username,
        first_name: first_name,
        last_name: last_name,
        uuid: uuid,
      },
      process.env.SECRET_TOKEN,
      { expiresIn: "365d" }
    ),
  });

  if (document != null) {
    return responseStatus(res, 200, true, { token: document.token });
  }

  // Well I probably should log this error...
  return responseStatus(res, 500, false, {
    message:
      "Internal error 500, the server experienced unexpected error, the system administrators have been notified.",
  });
});

Router.post("/login", async (req, res) => {
  const user = await User.findOne({
    username: req.body.username.toLowerCase(),
    password: Crypto.createHash("sha256")
      .update(req.body.password)
      .digest()
      .toString("hex"),
  });

  if (user !== null) {
    return responseStatus(res, 200, true, { token: user.token });
  }

  return responseStatus(res, 200, false, {
    message: "Wrong password or username.",
  });
});

Router.get("/@me", jwtAuthentication, (req, res) => {
  // return the JWT token information.
  return responseStatus(res, 200, true, {
    username: req.user.username,
    first_name: req.user.first_name,
    last_name: req.user.last_name,
    uuid: req.user.uuid,
  });
});

module.exports = Router;
