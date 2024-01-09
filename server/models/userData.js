const { Schema, model, Types } = require("mongoose");

const userDataSchema = new Schema({
  title: String,
  main: String,
});

const UserData = model("userData", userDataSchema);

module.exports = UserData;
