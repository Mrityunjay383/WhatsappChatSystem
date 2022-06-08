const app = require("./app.js");

const {PORT} = process.env;

app.listen(PORT, () => console.log(`User System Server is running at port ${PORT}...`));
