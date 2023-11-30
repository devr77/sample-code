const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: "Appointment",
    required: [true, "Doctor must belong to database"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "User must belong to a database"],
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: "Doctor",
    required: [true, "Doctor must belong to database"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  review: {
    type: String,
  },
  cleanliness: {
    type: Number,
    min: 1,
    max: 5,
  },
  staffBehavior: {
    type: Number,
    min: 1,
    max: 5,
  },
  WaitingTime: {
    type: Number,
    min: 1,
    max: 5,
  },
  OtherRecommendation: {
    type: Boolean,
  },
  bookingProcess: {
    type: Number,
    min: 1,
    max: 5,
  },
  otherFeedback: {
    type: String,
    default: "default",
  },
});

const Review = mongoose.model("Feedback", FeedbackSchema);

module.exports = Review;
