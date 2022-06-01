const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');

const contactSchema = new mongoose.Schema({
});

const Contact = mongoose.model("Contact", chatSchema);

module.exports = Contact;
