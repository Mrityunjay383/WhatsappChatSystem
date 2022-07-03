const axios = require("axios").default;
const { URLSearchParams } = require('url');

exports.sendMessage = (message, destination) => {

  //sending the message to the perticular destination for which it belong
  const encodedParams = new URLSearchParams();
  encodedParams.set('message', `{"text": "${message}","type":"text"}`);
  encodedParams.set('channel', 'whatsapp');
  encodedParams.set('source', '917397694169');
  encodedParams.set('destination', destination);
  encodedParams.set('src.name', process.env.GUPSHUP_APP_NAME);
  encodedParams.set('disablePreview', 'false');

  const options = {
    method: 'POST',
    url: 'https://api.gupshup.io/sm/api/v1/msg',
    headers: {
      Accept: 'application/json',
      apikey: process.env.GUPSHUP_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: encodedParams,
  };

  axios.request(options).then(function (response) {

  }).catch(function (error) {
    console.error(error);
  });
}
