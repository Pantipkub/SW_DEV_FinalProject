const MassageCenter = require('../models/MassageCenter');
const Appointment = require('../models/Appointment');

//@desc     Get all massage centers
//@route    GET /api/b1/massageCenters
//@access   Public
exports.getMassageCenters = async (req, res, next) => {
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
    query = MassageCenter.find(JSON.parse(queryStr)).populate('appointments');  //Changing back to JSON form
    
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
    const total = await MassageCenter.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Executing query
    const massageCenter = await query;
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
    res.status(200).json({ success: true, count: massageCenter.length, pagination, data: massageCenter });
  } catch(err) {
    res.status(400).json({ sucess: false });
  }
  
};

//@desc     Get single massage center
//@route    GET /api/b1/massageCenters/:id
//@access   Public
exports.getMassageCenter = async (req, res, next) => {
  try {
    const massageCenter = await MassageCenter.findById(req.params.id);

    if(!massageCenter){
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ sucess: true, data: massageCenter });
  } catch(err) {
    res.status(400).json({ success: false });
  }
  // res.status(200).json({ success: true, msg: `Get Massage Center ${req.params.id}` });
};

//@desc     Create a massage center
//@route    POST /api/b1/massageCenters
//@access   Private
exports.createMassageCenters = async (req, res, next) => {
  // console.log(req.body);
  const massageCenter = await MassageCenter.create(req.body);
  res.status(201).json({ success: true, data: massageCenter });
};

//@desc     Update single massage center
//@route    PUT /api/b1/massageCenters/:id
//@access   Private
exports.updateMassageCenter = async (req, res, next) => {
  try {
    const massageCenter = await MassageCenter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true //check if the updated data is correct 
    });

    if(!massageCenter){
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: massageCenter });
  } catch(err) {
    res.status(400).json({ success: false });
  }
  // res.status(200).json({ success: true, msg: `Update Massage Center ${req.params.id}` });
};

//@desc     Delete single massage center
//@route    DELETE /api/b1/massageCenters/:id
//@access   Private
exports.deleteMassageCenter = async (req, res, next) => {
  try {
    const massageCenter = await MassageCenter.findById(req.params.id);

    if(!massageCenter){
      return res.status(404).json({ success: false, message:`Massage Center not found with id of ${req.params.id}` });
    }
    await Appointment.deleteMany({ massageCenter: req.params.id });
    await MassageCenter.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch(err) {
    res.status(400).json({ success: false });
  }
  // res.status(200).json({ success: true, msg: `Delete Massage Center ${req.params.id}` });
};
