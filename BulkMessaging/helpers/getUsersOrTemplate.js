const axios = require("axios").default;

exports.allOtpedUsers = async (appName, apikey) => {

  let allUsers = [];

  const optionsForGet = {
    method: 'GET',
    url: `https://api.gupshup.io/sm/api/v1/users/${appName}`,
    headers: {apikey: apikey}
  };

  await axios.request(optionsForGet).then(function (response) {
    allUsers = [...response.data.users];
  }).catch(function (error) {
    console.error(error);
  });

  const onlyOtpedinUsers = await allUsers.filter((user) => {
    return user.optinStatus === "OPT_IN"
  });

  // console.log(onlyOtpedinUsers);

  return onlyOtpedinUsers;
}

exports.allAprovedTemplates = async (appName, apikey) => {

  let allTemplates = [];

  const options = {
    method: 'GET',
    url: `https://api.gupshup.io/sm/api/v1/template/list/${appName}`,
    headers: {apikey: apikey}
  };

  await axios.request(options).then(function (response) {
    allTemplates = [...response.data.templates];
  }).catch(function (error) {
    console.error(error);
  });

  const allAprovedTemplates = await allTemplates.filter((template) => {
    return template.status === "APPROVED" && template.elementName !== "app_template_notification"
  });

  return allAprovedTemplates;
}
