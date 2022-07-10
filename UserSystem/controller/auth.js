const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require("../model/user");

exports.register = async (req, res) => {

  try {

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      creatorUID,
      assignedNumber,
      appName,
      apiKey
    } = req.body;

    if (!(firstName && lastName && email && password && role)) {
      res.status(422).send("All fields are required");
    }
    if (req.userData.role !== role) {
      const existingUser = await User.findOne({
        email
      });
      if (existingUser) {
        return res.status(401).send("User already exist");
      }

      const encPassword = await bcrypt.hash(password, 10);

      let user;
      console.log(role);

      if(role === "Manager"){
        user = await User.create({
          firstName,
          lastName,
          email: email.toLowerCase(),
          password: encPassword,
          role,
          assignedNumber,
          appName,
          apiKey
        });
      }else{
        user = await User.create({
          firstName,
          lastName,
          email: email.toLowerCase(),
          password: encPassword,
          creatorUID,
          role
        });
      }

      //token
      const token = jwt.sign({
          user_id: user._id,
          email,
          role: user.role,
          name: `${user.firstName} ${user.lastName}`
        },
        process.env.SECRET_KEY, {
          expiresIn: "2h"
        }
      );

      user.token = token;

      user.password = undefined;

      return res.status(201).json(user);
    } else {
      return res.status(403).send("Access Denide!! You can't add new a manager");
    }

  } catch (e) {
    console.log(e);
  }

}

exports.login = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    const user = await User.findOne({
      email
    });

    if (user && (await bcrypt.compare(password, user.password))) {

      //token
      const token = jwt.sign({
          user_id: user._id,
          email,
          role: user.role,
          creatorUID: user.creatorUID,
          name: `${user.firstName} ${user.lastName}`
        },
        process.env.SECRET_KEY, {
          expiresIn: "2h"
        }
      );

      user.password = undefined;

      // Setting Up cookies
      const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true
      };

      return res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user
      });

    }

    res.status(400).send("Email or password incorrect");

  } catch (e) {
    console.log(e);
  }

}

exports.logout = (req, res) => {
  res.clearCookie('token').send("Done");
}
