const axios = require("axios").default;

exports.allOtpedUsers = async () => {

  let allUsers = [];

  const optionsForGet = {
    method: 'GET',
    url: 'https://api.gupshup.io/sm/api/v1/users/shortroute',
    headers: {apikey: process.env.GUPSHUP_API_KEY}
  };

  await axios.request(optionsForGet).then(function (response) {
    allUsers = [...response.data.users];
  }).catch(function (error) {
    console.error(error);
  });

  const onlyOtpedinUsers = await allUsers.filter((user) => {
    return user.optinStatus === "OPT_IN"
  });

  return onlyOtpedinUsers;
}

exports.allAprovedTemplates = async () => {

  let allTemplates = [];

  const options = {
    method: 'GET',
    url: 'https://api.gupshup.io/sm/api/v1/template/list/shortroute',
    headers: {apikey: process.env.GUPSHUP_API_KEY}
  };

  await axios.request(options).then(function (response) {
    allTemplates = [...response.data.templates];
  }).catch(function (error) {
    console.error(error);
  });

  // const allAprovedTemplates = await allTemplates.filter((template) => {
  //   return template.status === "APPROVED"
  // });

  return allTemplates;
}
