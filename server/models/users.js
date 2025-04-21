const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: { 
    type: String,
    unique: true 
  },
  visibility: {
    type: Boolean,
    default: false,
  },  
});

module.exports = mongoose.model("Users", usersSchema);
