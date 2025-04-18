const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// Get statistics for a specific massage center
exports.getDailyReservations = async (req, res, next) => {
    try {
        const massageCenterId = req.params.massageCenterId; // รับ id ร้านนวดมาจาก URL

        const stats = await Appointment.aggregate([
            { 
              $match: { massageCenter: new mongoose.Types.ObjectId(massageCenterId) } 
            },
            {
              $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$apptDate" } },
                  totalAppointments: { $sum: 1 }
              }
            },
            { 
              $project: { 
                  date: "$_id",  // เปลี่ยน _id เป็น date
                  totalAppointments: 1,
                  _id: 0 // ซ่อน _id ดั้งเดิม
              }
            },
            { $sort: { date: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Cannot get statistics' });
    }
};


// Get most popular shops
exports.getPopularMassageCenters = async (req, res, next) => {
    try {
        const stats = await Appointment.aggregate([
            {
                $group: {
                    _id: "$massageCenter",
                    totalBookings: { $sum: 1 }
                }
            },
            { $sort: { totalBookings: -1 } },
            { $limit: 5 }, // เอา 5 อันดับแรก
            {
                $lookup: {
                    from: "massagecenters",
                    localField: "_id",
                    foreignField: "_id",
                    as: "massageCenterDetails"
                }
            },
            { $unwind: "$massageCenterDetails" }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Cannot get popular shops' });
    }
};
