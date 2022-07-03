const jwt = require('jsonwebtoken');

const User = require("../model/user");

exports.home = (req, res) => {
  res.status(200).json({
    user: req.userData
  });
}

exports.agents = async (req, res) => {

  try {

    await User.find({
      role: "Agent"
    }, (err, foundAgents) => {

      for(let agent of foundAgents){
        agent.password = undefined;
      }

      return res.status(200).json({
        agents: foundAgents
      });
    }).clone();

  } catch (e) {
    console.log(e);
  }

}

exports.indiUser = async (req, res) => {
  const {userId, userRole} = req.body;//Getting Id and role from the body of the request

  try{

    await User.findOne({_id: userId, role: userRole}, (err, foundUser) => {
      if(!foundUser){
        return res.status(404).send("User not found");
      }else{
        foundUser.password = undefined;
        return res.status(200).json({
          foundUser
        });
      }
    }).clone();

  }catch(e){
    console.log(e);
  }
}

exports.managers = async (req, res) => {

  try {

    await User.find({
      role: "Manager"
    }, (err, foundManagers) => {
      return res.status(200).json({
        managers: foundManagers
      });
    }).clone();

  } catch (e) {
    console.log(e);
  }

}

exports.delAgent = async (req, res) => {

  try {

    const agentID = req.body.userID;


    await User.findByIdAndRemove(agentID, function(err, data) {
      if (!err) {
        data.password = undefined;
        return res.status(200).json({DeletedAgent: data});
      }
    });

  } catch (e) {
    console.log(e);
  }

}

exports.delManager = async (req, res) => {

  try {

    const managerId = req.body.userID;

    await User.findByIdAndRemove(managerId, function(err, data) {
      if (!err) {
        data.password = undefined;
        res.status(200).json({DeletedAgent: data});
      }
    });

  } catch (e) {
    console.log(e);
  }

}

exports.changeName = async (req, res) => {
  try{
    const {firstName, lastName, email} = req.body;

    await User.findOne({ email }, async (err, foundUser) => {
      if(foundUser){
        foundUser.firstName = firstName;
        foundUser.lastName = lastName;

        foundUser.save(async (err) => {
          if(!err){
            let data = await jwt.verify(req.cookies.token, process.env.SECRET_KEY);
            data = {...data, name: firstName+" "+lastName}

            const token = jwt.sign(
              {...data},
              process.env.SECRET_KEY
            );

            // Setting Up cookies
            const options = {
              expires: new Date(Date.now() + 24*60*60*1000),
              httpOnly: true
            };

            return res.status(200).cookie('token', token, options).json({newName: firstName+" "+lastName})
          }
        });
      }else{
        return res.status(404).send("User Not Found");
      }
    }).clone()
  }catch(e){
    console.log(e);
  }
}
