const jwt = require('jsonwebtoken');

const User = require("../model/user");

//Checking if the token if valid or not
const valToken = async (req, res, next) => {
  try {
    // looking for token in the header
    let authHeaderVal = req.cookies.token || req.headers.authorization;

    if (!authHeaderVal) {
      return res.status(403).send("token not found");
    }

    const token = authHeaderVal.replace("Bearer ", ""); //replacing Bearer from token if getting from header

    const data = jwt.verify(token, process.env.SECRET_KEY); //verifing token with the secret key
    req.userData = data;
    next();

  } catch (e) {
    return res.status(401).json({
      msg: "Auth failed not verified user",
      err: e
    });
  }

}

const isAdmin = (req, res, next) => {
  if(req.userData.user_role != "Admin"){
    return res.status(403).send("Access Denied!! You are not an Admin");
  }
  return next();
}

module.exports = {
  valToken,
  isAdmin
}
