const jwt = require('jsonwebtoken');

const User = require("../model/user");

//Checking if the token if valid or not
const valToken = async (req, res, next) => {
  try {
    // looking for tacken in the header
    const [tokenInit, token] = req.headers.authorization.split(" ");

    if (tokenInit == "Bearer") {
      const data = jwt.verify(token, process.env.SECRET_KEY);
      req.userData = data;
      next();
    }
  } catch (e) {
    return res.status(401).json({
      msg:"Auth failed not verified user",
      err: e
    });
  }

}

module.exports = {valToken}
