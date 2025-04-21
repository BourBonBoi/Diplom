const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: Boolean,
    default: false,
  },
  deadline: {
    type: Date,
  },
  created_on: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: String,
    required: true,
  },
  priority: { 
    type: String, 
    enum: [
      "urgent-important",
      "not-urgent-important",
      "urgent-not-important",
      "not-urgent-not-important"
    ],
    default: "not-urgent-not-important"
  },
  photo: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Tasks", tasksSchema);
