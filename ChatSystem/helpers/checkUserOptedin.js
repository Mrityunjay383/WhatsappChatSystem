const axios = require("axios").default;
const { URLSearchParams } = require('url');

exports.otpedinUser = async (dial_code, phone) => {

  let optedinUsers = [];

  const optionsForGet = {
    method: 'GET',
    url: `https://api.gupshup.io/sm/api/v1/users/${process.env.GUPSHUP_APP_NAME}`,
    headers: {apikey: process.env.GUPSHUP_API_KEY}
  };

  await axios.request(optionsForGet).then(function (response) {
    optedinUsers = [...response.data.users];
  }).catch(function (error) {
    console.error(error);
  });

  for(let user of optedinUsers){
    if(user.phoneCode === dial_code && user.optinStatus === "OPT_IN"){
      console.log("User Alread Otpedin");
      return;
    }
  }

  const encodedParams = new URLSearchParams();
  encodedParams.set('user', phone);

  const optionsForPost = {
    method: 'POST',
    url: `https://api.gupshup.io/sm/api/v1/app/opt/in/${process.env.GUPSHUP_APP_NAME}`,
    headers: {
      apikey: process.env.GUPSHUP_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: encodedParams,
  };

  axios.request(optionsForPost).then(function (response) {
    console.log(response.data);
  }).catch(function (error) {
    console.error(error);
  });
  return;
}
