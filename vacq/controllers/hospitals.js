const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');

//@desc     Get all hospitals
//@route    GET /api/b1/hospitals
//@access   Public
exports.getHospitals = async (req, res, next) => {
  try {
    let query;

    //Copy req.query
    const reqQuery = {...req.query};  //Array form

    //Fields to exclude
    const removeFields = ['select','sort','page','limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(req.query);
      //Create operators ($gt, $gte, etc.)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);

    //Finding resource
    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');  //Changing back to JSON form
    
    //Select Fields
    if(req.query.select){
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    //Sort
    if(req.query.sort){
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    }else{
      query = query.sort('-createdAt'); 
    }

    //Pagination
    const page = parseInt(req.query.page,10) || 1;
    const limit = parseInt(req.query.limit,10) || 25;
    const startIndex = (page-1)*limit;
    const endIndex = page*limit;
    const total = await Hospital.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Executing query
    const hospital = await query;
    //Pagination result
    const pagination = {};
    if(endIndex<total){
      pagination.next={
        page:page+1,
        limit
      }
    }

    if(startIndex>0){
      pagination.prev={
        page:page-1,
        limit
      }
    }
    res.status(200).json({ success: true, count: hospital.length, pagination, data: hospital });
  } catch(err) {
    res.status(400).json({ sucess: false });
  }
  
};

//@desc     Get single hospital
//@route    GET /api/b1/hospitals/:id
//@access   Public
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if(!hospital){
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ sucess: true, data: hospital });
  } catch(err) {
    res.status(400).json({ success: false });
  }
  // res.status(200).json({ success: true, msg: `Get hospital ${req.params.id}` });
};

//@desc     Create a hospital
//@route    POST /api/b1/hospitals
//@access   Private
exports.createHospitals = async (req, res, next) => {
  // console.log(req.body);
  const hospital = await Hospital.create(req.body);
  res.status(201).json({ success: true, data: hospital });
};

//@desc     Update single hospital
//@route    PUT /api/b1/hospitals/:id
//@access   Private
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true //check if the updated data is correct 
    });

    if(!hospital){
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: hospital });
  } catch(err) {
    res.status(400).json({ success: false });
  }
  // res.status(200).json({ success: true, msg: `Update hospital ${req.params.id}` });
};

//@desc     Delete single hospital
//@route    DELETE /api/b1/hospitals/:id
//@access   Private
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if(!hospital){
      return res.status(404).json({ success: false, message:`Hospital not found with id of ${req.params.id}` });
    }
    await Appointment.deleteMany({ hospital: req.params.id });
    await Hospital.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch(err) {
    res.status(400).json({ success: false });
  }
  // res.status(200).json({ success: true, msg: `Delete hospital ${req.params.id}` });
};
