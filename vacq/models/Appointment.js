const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    apptDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    massageCenter: {
        type: mongoose.Schema.ObjectId,
        ref: 'MassageCenter',
        required: true
    },
    createdAt: {
        type: Date,
        defaut: Date.now
    },
    apptEnd: { 
        type: Date, 
        required: true 
    }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);