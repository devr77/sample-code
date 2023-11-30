const mongoose = require('mongoose');

const helpSchema = new mongoose.Schema(
    {
        createdAt: {
            type: Date,
            default: Date.now
          },
          doctor: {
            type: mongoose.Schema.ObjectId,
            ref: 'Doctor',
            required: [true, 'Doctor must belong to database']
          },
          user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'User must belong to database']
          },
          appointment:{
            type:mongoose.Schema.ObjectId,
            ref:'Appointment',
            required:[true,'Appointment must belong to database']
          },
          description:{
            type: String,
            required:[true,'A HelpAndSupport must have description']
          }

    }
)

const Help = mongoose.model('Help',helpSchema);

module.exports = Help;



// summary,status,