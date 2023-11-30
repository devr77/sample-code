const mongoose = require('mongoose');


const PrescriptionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter Prescription Name']
    },
    doctor:{
        type:mongoose.Schema.ObjectId,
        ref:'Doctor'
    }
});

PrescriptionSchema.set('toJSON', {
    transform: (doc, ret, options) => {
        delete ret.__v;
        ret.id = ret._id.toString();
        delete ret._id;
    },
  });

const PrescriptionName = mongoose.model('PrescriptionName',PrescriptionSchema);

module.exports = PrescriptionName;