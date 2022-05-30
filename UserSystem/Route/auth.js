const express = require("express");
const router = express.Router();
const session = require('express-session');
const passport = require('passport');

const { auth, isLogedIn } = require('../Middleware/auth.js');

const User = require("../Model/user");


router.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, () => {
          res.status(200).json({msg: "Login Successfull"})
      });
    }
  });
});

router.post("/register", async (req, res) => {

  console.log(req.body);

  console.log(req.body.username);

  const reqUser = {
    name: req.body.name,
    username: req.body.username,
    password: req.body.password
  }

  // console.log(reqUser);

  await User.register({username: reqUser.username}, reqUser.password, (err, user) => {
    if(err){
      console.log(err);
      res.status(500).json({msg: err})
    }else{
      user.name = reqUser.name;
      user.save();

      passport.authenticate("local")(req, res, () => {
          res.status(200).json({msg: "Register Successfull"})
      });
    }
  });
});

router.get("/logout", async (req, res) => {
  req.logout();
  res.status(200).json({msg: "Logout Successfull"})
})

module.exports = router;
