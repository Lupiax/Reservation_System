const jwt = require("jsonwebtoken");

function jwtAuthentication(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
    // TODO: if the error is "token" expired, please regenerate the token.
    if (err)
      return responseStatus(res, 403, false, {
        message: "The given authorization token was invalid.",
      });

    req.user = user;

    next();
  });
}

const exportObject = {
  jwtAuthentication: jwtAuthentication,
};

module.exports = exportObject;
