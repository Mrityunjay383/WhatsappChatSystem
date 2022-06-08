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

    const agentID = req.body.agentID;

    await User.findByIdAndRemove(agentID, req.body, function(err, data) {
      if (!err) {
        data.password = undefined;
        res.status(201).json({DeletedAgent: data});
      }
    }).clone();

  } catch (e) {
    console.log(e);
  }

}

exports.delManager = async (req, res) => {

  try {

    const managerId = req.body.managerId;

    await User.findByIdAndRemove(managerId, req.body, function(err, data) {
      if (!err) {
        data.password = undefined;
        res.status(201).json({DeletedAgent: data});
      }
    }).clone();

  } catch (e) {
    console.log(e);
  }

}
