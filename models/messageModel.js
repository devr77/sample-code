const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Sender is Required"],
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Receiver is required"],
  },
  types: {
    type: String,
    required: [true, "Message type is required "],
  },
  imageUrl: {
    type: String,
  },
  data: {
    type: String,
    required: [true, "data is required "],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDelivered: {
    type: Boolean,
    default: false,
  },
  isSeen: {
    type: Boolean,
    default: false,
  },
});

// MessageSchema.set("toJSON", {
//   transform: (doc, ret, options) => {
//     delete ret.__v;
//     ret.id = ret._id.toString();
//     delete ret._id;
//   },
// });
const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
