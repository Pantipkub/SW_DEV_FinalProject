const express = require('express');
const { getDailyReservations, getPopularMassageCenters } = require('../controllers/statistic');

const router = express.Router();

// รายวันของร้านนั้น
router.get('/massageCenters/:massageCenterId/daily-reservations', getDailyReservations);

// ร้านยอดนิยม
router.get('/popular-shops', getPopularMassageCenters);

module.exports = router;
