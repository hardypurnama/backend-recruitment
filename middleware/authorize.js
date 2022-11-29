const jwt = require("jsonwebtoken");

decodeToken = (token) => {
  return jwt.verify(token, "secret");
};

authorize = (rolename) => (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    const payload = decodeToken(token);

    if (!!rolename && payload.role.includes(rolename)) {
      throw new "token tidak sesuai"();
    }

    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({
      error: {
        name: err.name,
        message: err.message,
        details: err.details || null,
      },
    });
  }
};

module.exports = {
  decodeToken,
  authorize,
};
