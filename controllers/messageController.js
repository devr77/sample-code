var ObjectId = require("mongodb").ObjectID;
const catchAsync = require("../utils/catchAsync");
const Message = require("./../models/messageModel");
const Doctor = require("./../models/doctorsModel");

// No of User 1-1 Chat
exports.getUserChatsCount = catchAsync(async (req, res) => {
  let Id = req.uid;
  const ImageUrl = `https://${process.env.BUCKET}.s3.${process.env.REGION}.amazonaws.com/doctor/`;
  const count = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: ObjectId(req.uid) }, { receiver: ObjectId(req.uid) }],
      },
    },
    {
      $project: {
        sender: 1,
        receiver: 1,
        data: 1,
        createdAt: 1,
        types: 1,
        fromToReceiver: ["$receiver", "$sender"],
      },
    },
    {
      $unwind: "$fromToReceiver",
    },

    {
      $sort: {
        fromToReceiver: 1,
      },
    },
    {
      $group: {
        _id: "$_id",
        fromToReceiver: {
          $push: "$fromToReceiver",
        },
        sender: {
          $first: "$sender",
        },
        receiver: {
          $first: "$receiver",
        },
        types: {
          $first: "$types",
        },
        data: {
          $first: "$data",
        },
        createdAt: {
          $first: "$createdAt",
        },
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $group: {
        _id: "$fromToReceiver",
        sender: {
          $first: "$sender",
        },
        receiver: {
          $first: "$receiver",
        },
        types: {
          $first: "$types",
        },
        data: {
          $first: "$data",
        },
        createdAt: {
          $first: "$createdAt",
        },
      },
    },
    {
      $project: {
        sender: 1,
        receiver: 1,
        types: 1,
        data: 1,
        createdAt: 1,
        foo: { $toString: "$sender" },
      },
    },
    {
      $project: {
        sender: 1,
        receiver: 1,
        types: 1,
        data: 1,
        createdAt: 1,
        userId: {
          $cond: {
            if: {
              $eq: ["$foo", Id],
            },
            then: "$receiver",
            else: "$sender",
          },
        },
      },
    },
    {
      $lookup: {
        from: "doctors",
        as: "userInfo",
        pipeline: [
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              fullName: 1,
              image: 1,
            },
          },
        ],
      },
    },
  ]);

  res.status(200).send({
    status: "Success",
    count,
    Id,
    ImageUrl,
  });
});

// User Messages
// Validate Page No
exports.messages = catchAsync(async (req, res, next) => {
  const limit = req.query.limit || 4;
  const page = req.query.page || 1;
  const skip = (page - 1) * limit;

  const totalMessages = await Message.find({
    $or: [{ sender: req.uid }, { sender: req.query.receiver }],
  }).count();

  const messages = await Message.find({
    $or: [{ sender: req.uid }, { sender: req.query.receiver }],
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  res.status(200).send({
    status: "Success",
    messages,
    count: messages.length,
    totalMessages: totalMessages,
    currentPage: page * 1,
    totalPage: Math.ceil(totalMessages / limit),
  });
});

// Create Message
exports.message = catchAsync(async (req, res, next) => {
  const message = await Message.create({
    sender: req.uid,
    receiver: req.body.receiver,
    types: req.body.types,
    data: req.body.data,
  });
  res.status(200).send({
    status: "Success",
    message,
  });
});
