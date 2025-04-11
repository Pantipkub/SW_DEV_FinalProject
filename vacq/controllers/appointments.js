const Appointment = require('../models/Appointment');
const MassageCenter = require('../models/MassageCenter');
const sendNotificationEmail = require('../utils/sendNotificationEmail'); // เปลี่ยน path ตามจริง

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

        //Add user Id to req.body
        req.body.user = req.user.id;

        //Check for wxisted appointment
        const existedAppointments = await Appointment.find({user:req.user.id});

        //If the user is not an admin, they can only create 3 appointment.
        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success: false, message: `The user with ID ${req.user.id} has already made 3 appointments`});
        }
        
        const appointment = await Appointment.create(req.body);

         // Send email notification
         console.log(req.user.email);
         await sendNotificationEmail(
            req.user.email,  // ต้องแน่ใจว่า req.user มี email ด้วยนะ
            req.user.name || "User",
            "book",
            `Massage Center: ${massageCenter.name}, Date: ${req.body.date}, Time: ${req.body.time || 'N/A'}`
        );

        res.status(200).json({
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
        let appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false, message:`No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({succes: false, message:`User ${req.user.id} is not authorized to update this appointment`})
        }

        appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate({
            path: 'massageCenter',
            select: 'name province tel'
          });
        await sendNotificationEmail(
            req.user.email,  // ต้องแน่ใจว่า req.user มี email ด้วยนะ
            req.user.name || "User",
            "update",
            `Massage Center: ${massageCenter.name}, Date: ${req.body.date}, Time: ${req.body.time || 'N/A'}`
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
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success: false, message:`No appointment with the id of ${req.params.id}`});
        }

        //Make sure user is the appointment owner
        if(appointment.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({succes: false, message:`User ${req.user.id} is not authorized to delete this bootcamp`})
        }

        await appointment.deleteOne();

        await sendNotificationEmail(
            req.user.email,  
            req.user.name || "User",
            "cancel",
            `Cancel kub, Date: ${req.body.date}, Time: ${req.body.time || 'N/A'}`
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
