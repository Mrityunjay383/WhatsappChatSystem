const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');

const chatSchema = new mongoose.Schema({
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
