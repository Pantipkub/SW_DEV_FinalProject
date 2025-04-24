const Appointment = require('../models/Appointment');
const MassageCenter = require('../models/MassageCenter');
const sendNotificationEmail = require('../utils/sendNotificationEmail'); // เปลี่ยน path ตามจริง
const { Types } = require('mongoose');

//@desc     Get all appointments
//@route    GET /api/v1/appointments
//@access   Public
exports.getAppointments=async (req, res, next) => {
    let query;
    //General users can see only their appointments!
    if(req.user.role !== 'admin'){
        query = Appointment.find({user: req.user.id}).populate({
          path: 'massageCenter',
          select: 'name province tel'
        });
    }else{    //If you are an admin, you can see all!
        if(req.params.massageCenterId){
            console.log(req.params.massageCenterId);
            query = Appointment.find({massageCenter: req.params.massageCenterId}).populate({
              path: 'massageCenter',
              select: 'name province tel'
            });
        }else{
            query = Appointment.find().populate({
              path: 'massageCenter',
              select: 'name province tel'
            });
        }
    }
    try{
        const appointments = await query;
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Appointment"});
    }
};

//@desc     Get single appointment
//@route    GET /api/v1/appointments/:id
//@access   Public
exports.getAppointment=async (req, res, next) => {
    try{
        const appointment = await Appointment.findById(req.params.id).populate({
          path: 'massageCenter',
          select: 'name description tel'
        });

        if(!appointment){
          return res.status(404).json({success: false, message: `No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot find Appointment"});
    }
};

//@desc     Add an appointment
//@route    POST /api/v1/massageCenters/:massageCenterId/appointments
//@access   Private
exports.addAppointment=async (req, res, next) => {
    try{
        req.body.massageCenter = req.params.massageCenterId;

        const massageCenter = await MassageCenter.findById(req.params.massageCenterId);

        if(!massageCenter){
            return res.status(404).json({success:false, message: `No massage center with the id of ${req.params.massageCenterId}`});
        }

        // Extract the start and end time of the appointment from req.body
        const appointmentStart = new Date(req.body.apptDate);   // We use apptDate as a apptStart
        const appointmentEnd = new Date(req.body.apptEnd);

        // Check if the appointment is within business hours
        const timeCheck = checkAppointmentTime(appointmentStart, appointmentEnd, massageCenter);
        if (!timeCheck.valid) {
            return res.status(400).json({ success: false, message: timeCheck.message });
        }

        // Check for overlapping appointments
        const overlapCheck = await checkOverlappingAppointments(appointmentStart, appointmentEnd, massageCenter._id);
        if (!overlapCheck.valid) {
            return res.status(400).json({ success: false, message: overlapCheck.message });
        }

        //Add user Id to req.body
        req.body.user = req.user.id;

        const appointmentDate = new Date(req.body.apptDate);
        const dateOnly = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeOnly = appointmentDate.toISOString().split('T')[1].slice(0, 5); // "HH:mm"
    
        const appointmentDateEnd = new Date(req.body.apptEnd);
        const timeOnlyEnd = appointmentDateEnd.toISOString().split('T')[1].slice(0, 5); 


        //Check for existed appointment
        const existedAppointments = await Appointment.find({user:req.user.id});

        //If the user is not an admin, they can only create 3 appointment.
        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 appointments`});
        }
        
        const appointment = await Appointment.create(req.body);

         //Send email notification
         await sendNotificationEmail(
            req.user.email,  // Make sure req.user contains an email
            req.user.name || "User",
            "book",
            `📍 Massage Center Reservation Confirmation

            Hello ${req.user.name || 'Customer'},

            🧖‍♀️ You have successfully booked a massage session.

            🧾 **Booking Details:**
            • Massage Center: ${massageCenter.name}
            • Date: ${dateOnly}
            • Time: ${timeOnly || 'N/A'} - ${timeOnlyEnd || 'N\A'}

            Thank you for using our service. We look forward to seeing you! 😊`);

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot create Appointment"});
    }
};

//@desc     Update an appointment
//@route    PUT /api/v1/appointments/:id
//@access   Private
exports.updateAppointment=async (req, res, next) => {
    try{
        let appointment = await Appointment.findById(req.params.id).populate('massageCenter');

        if(!appointment){
            return res.status(404).json({success:false, message:`No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({succes: false, message:`User ${req.user.id} is not authorized to update this appointment`})
        }

        const appointmentStart = new Date(req.body.apptDate);
        const appointmentEnd = new Date(req.body.apptEnd);
        
        const timeCheck = checkAppointmentTime(appointmentStart, appointmentEnd, appointment.massageCenter);
        if (!timeCheck.valid) {
            return res.status(400).json({ success: false, message: timeCheck.message });
        }
        
        const overlapCheck = await Appointment.findOne({
            _id: { $ne: new Types.ObjectId(String(req.params.id)) }, // Check for overlapping appointments, excluding the current one
            massageCenter: appointment.massageCenter._id,
            $or: [
                {
                    apptStart: { $lt: appointmentEnd },
                    apptEnd: { $gt: appointmentStart }
                }
            ]
        });
        if (overlapCheck) {
            return res.status(400).json({ success: false, message: 'Appointment overlaps with another booking' });
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: 'massageCenter',
            select: 'name province tel'
          });
          const appointmentDate = new Date(req.body.apptDate);
          const dateOnly = appointmentDate.toISOString().split('T')[0];
          const timeOnly = appointmentDate.toISOString().split('T')[1].slice(0, 5); // "HH:mm"
          const timeOnlyEnd = appointmentEnd.toISOString().split('T')[1].slice(0, 5); 
      
        console.log(`${dateOnly} time : ${timeOnly}`);
        
        await sendNotificationEmail(
            req.user.email,
            req.user.name || "User",
            "update",
       `
        ✅ Your appointment has been successfully updated.

        📍 Massage Center: ${appointment.massageCenter.name}
        📅 New Date: ${dateOnly}
        ⏰ New Time: ${timeOnly || 'N/A'} - ${timeOnlyEnd || 'N\A'}


        Thank you for using our service! 🙌
        `
        );
          
        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot update Appointment"});
    }
};

//@desc     Delete an appointment
//@route    Delete /api/v1/appointments/:id
//@access   Private
exports.deleteAppointment=async (req, res, next) => {
    try{
        const appointment = await Appointment.findById(req.params.id).populate('massageCenter');

        if(!appointment){
            return res.status(404).json({success: false, message:`No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({succes: false, message:`User ${req.user.id} is not authorized to delete this bootcamp`})
        }


        const appointmentDate = new Date(appointment.apptDate);
        const dateOnly = appointmentDate.toISOString().split('T')[0];
        const timeOnly = appointmentDate.toISOString().split('T')[1].slice(0, 5); // "17:01"
        const appointmentDateEnd = new Date(appointment.apptEnd);
        const timeOnlyEnd = appointmentDateEnd.toISOString().split('T')[1].slice(0, 5); 
        

        await appointment.deleteOne();
        
         // Send cancellation email
         await sendNotificationEmail(
            req.user.email,
            req.user.name || "User",
            "cancel",
        `
        Your appointment has been successfully cancelled.

        📍 Massage Center: ${appointment.massageCenter.name}
        📅 Date: ${dateOnly}
        ⏰ Time: ${timeOnly || 'N/A'} - ${timeOnlyEnd || 'N\A'}
        
        `
        );

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot delete Appointment"});
    }
};

// Function to check if the appointment time is within business hours
const checkAppointmentTime = (appointmentStart, appointmentEnd, massageCenter) => {
    const [openHour, openMin] = massageCenter.openTime.split(':').map(Number);
    const [closeHour, closeMin] = massageCenter.closeTime.split(':').map(Number);

    const openDate = new Date(appointmentStart);
    openDate.setUTCHours(openHour, openMin, 0, 0);

    const closeDate = new Date(appointmentStart);
    closeDate.setUTCHours(closeHour, closeMin, 0, 0);

    // Check if the appointment is outside business hours
    if (appointmentStart < openDate || appointmentEnd > closeDate) {
        return { valid: false, message: 'Appointment is outside business hours' };
    }

    return { valid: true };
};

const checkOverlappingAppointments = async (appointmentStart, appointmentEnd, massageCenterId) => {
    // Step 1: Retrieve all appointments at this massage center on the same day
    const startOfDay = new Date(appointmentStart);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentStart);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    const sameDayAppointments = await Appointment.find({
        massageCenter: massageCenterId,
        apptStart: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Step 2: Manually check for overlapping logic
    for (let appt of sameDayAppointments) {
        if (
            appointmentStart < appt.apptEnd &&
            appointmentEnd > appt.apptDate
        ) {
            return {
                valid: false,
                message: "Appointment overlaps with existing booking"
            };
        }
    }
    
    return { valid: true };
};

