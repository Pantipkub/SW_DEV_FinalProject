const mongoose = require('mongoose');

const MassageCenterSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'Please add a name'],
        uniqued: true,
        trim: true,
        maxlength:[50,'Name can not be more than 50 characters']
    },
    address:{
        type: String,
        required: [true,'Please add an address']
    },
    district:{
        type: String,
        required: [true,'Please add a district']
    },
    province:{
        type: String,
        required: [true, 'Please add a province']
    },
    postalcode:{
        type: String,
        required: [true,'Please add a postalcode'],
        maxlength: [5,'Postal Code can not be more than 5 digits']
    },
    tel:{
        type: String
    },
    region:{
        type: String,
        required: [true,'Please add a region']
    },
    openTime: { 
        type: String, 
        required: true 
    },  // "10:00"
    closeTime: { 
        type: String, 
        required: true 
    }, // "20:00"

}, {
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
});

//Reverse populate with virtuals
MassageCenterSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'massageCenter',
    justOne: false
});

module.exports=mongoose.model('MassageCenter', MassageCenterSchema);