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
      return res.status(200).json({
        agents: foundAgents
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
