import doctorService from "../services/doctorService";

let getTopDoctorHome = async (req, res) => {
  let limit = req.query.limit;
  if (!limit) limit = 10;
  try {
    let response = await doctorService.getTopDoctorHome(+limit);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "ERROR FROM SERVER !",
    });
  }
};

let getAllDoctor = async (req, res) => {
  try {
    let doctors = await doctorService.getAllDoctor();
    return res.status(200).json(doctors);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error From Server - Get All Doctor Api",
    });
  }
};

let postInfoDoctor = async (req, res) => {
  try {
    let response = await doctorService.saveDetailsInfoDoctor(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error From Server - Get All Doctor Api",
    });
  }
};

let getDetailsDoctorById = async (req, res) => {
  try {
    let response = await doctorService.getDetailsDoctorById(req.query.id);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error From Server - getDetailsDoctorById API",
    });
  }
};

let bulkCreateSchedule = async (req, res) => {
  try {
    let response = await doctorService.bulkCreateSchedule(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log("Error From Server - bulkCreateSchedule API !");
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error From Server - getDetailsDoctorById API !",
    });
  }
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctor: getAllDoctor,
  postInfoDoctor: postInfoDoctor,
  getDetailsDoctorById: getDetailsDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
};
