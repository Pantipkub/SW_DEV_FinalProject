/**
 * @swagger
 * components:
 *   schemas: 
 *     MassageCenter:
 *       type: object
 *       required:
 *         - name
 *         - address
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: The auto-generated id of the massage center
 *           example: d290f1ee-6c54-4b01-90e6-d701748f0851
 *         ลําดับ:
 *           type: string
 *           description: Ordinal number
 *         name:
 *           type: string
 *           description: massage center name
 *         address:
 *           type: string
 *           description: House No., Street, Road
 *         district:
 *           type: string
 *           description: District
 *         province:
 *           type: string
 *           description: Province
 *         postalcode:
 *           type: string
 *           description: 5-digit postal code
 *         tel:
 *           type: string
 *           description: Telephone number
 *         region:
 *           type: string
 *           description: Region
 *       example:
 *         id: 609bda561452242d88d36e37
 *         ลําดับ: 
 *         name: Happy Massage Center
 *         address: 121 ถ.สุขุมวิท
 *         district: บางนา
 *         province: กรุงเทพมหานคร
 *         postalcode: 10110
 *         tel: 02-2187000
 *         region: กรุงเทพมหานคร (Bangkok)
 */

/**
 * @swagger
 * tags:
 *   name: MassageCenters
 *   description: The massage centers managing API
 */

/**
 * @swagger
 * /massageCenters:
 *   get:
 *     summary: Returns the list of all the massage centers
 *     tags: [MassageCenters]
 *     responses:
 *       200:
 *         description: The list of the massage centers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MassageCenter'
 */

/**
 * @swagger
 * /massageCenters/{id}:
 *   get:
 *     summary: Get the massage center by id
 *     tags: [MassageCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The massage center id
 *     responses:
 *       200:
 *         description: The massage center description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MassageCenter'
 *       404:
 *         description: The massage center was not found
 */

/**
 * @swagger
 * /massageCenters:
 *   post:
 *     summary: Create a new massage center
 *     tags: [MassageCenters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MassageCenter'
 *     responses:
 *       201:
 *         description: The massage center was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MassageCenter'
 *       500:
 *         description: Some server error
 */

/**
 * @swagger
 * /massageCenters/{id}:
 *   put:
 *     summary: Update the massage center by id
 *     tags: [MassageCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The massage center id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MassageCenter'
 *     responses:
 *       200:
 *         description: The massage center was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MassageCenter'
 *       404:
 *         description: The massage center was not found
 *       500:
 *         description: Some error happened
 */

/**
 * @swagger
 * /massageCenters/{id}:
 *   delete:
 *     summary: Remove the massage center by id
 *     tags: [MassageCenters]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The massage center id
 *     responses:
 *       200:
 *         description: The massage center was deleted
 *       404:
 *         description: The massage center was not found
 */

const express = require("express");
const { getMassageCenters, getMassageCenter, createMassageCenters, updateMassageCenter, deleteMassageCenter } = require("../controllers/massageCenters");

// Include other resource routers
const appointmentRouter = require('./appointments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth'); // Check if they have permission to do the methods

// Re-route into other resource routers
router.use('/:massageCenterId/appointments', appointmentRouter); 

router.route("/")
  .get(getMassageCenters)
  .post(protect, authorize('admin'), createMassageCenters); // Put on the protect in front of a function

router.route("/:id")
  .get(getMassageCenter)
  .put(protect, authorize('admin'), updateMassageCenter)
  .delete(protect, authorize('admin'), deleteMassageCenter);

module.exports = router;
