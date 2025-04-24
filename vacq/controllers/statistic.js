const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');
const MassageCenter = require('../models/MassageCenter'); // Import massage center model

// Get daily reservation statistics for a specific massage center
exports.getDailyReservations = async (req, res, next) => {
    try {
        const massageCenterId = req.params.massageCenterId; // Get massage center's id from the URL
        
      	// Validate if massageCenterId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(massageCenterId)) {
            return res.status(400).json({ success: false, message: 'Invalid massage center ID format' });
        }

        // Check if the massage center exists in the database
        const centerExists = await MassageCenter.findById(massageCenterId);
        if (!centerExists) {
            return res.status(404).json({ success: false, message: 'Massage center not found' });
        }
		
      	// Aggregate daily appointment counts for the specified massage center
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
                  date: "$_id",  // Rename _id to date
                  totalAppointments: 1,
                  _id: 0 		 // Exclude the original _id field
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


// Get the top 3 most popular massage centers based on appointment counts
exports.getPopularMassageCenters = async (req, res, next) => {
    try {
        const stats = await Appointment.aggregate([
            {
                $group: {
                    _id: "$massageCenter",
                    totalBookings: { $sum: 1 }
                }
            },
            { $sort: { totalBookings: -1 } },	// Sort descending by total bookings
            { $limit: 3 }, 						// Limit to top 3 results
            {
                $lookup: {
                    from: "massagecenters",		// Join with MassageCenter collection
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
