const mongoose = require("mongoose");

// https://mysql.tutorials24x7.com/blog/guide-to-design-database-for-notifications-in-mysql

const notificationSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Actor must belong to a database"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "User must belong to a database"],
  },
  entitytype: {
    type: Number,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});
