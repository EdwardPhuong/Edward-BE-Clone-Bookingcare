import clinicService from "../services/clinicService";

let createNewClinic = async (req, res) => {
	try {
		let response = await clinicService.createNewClinic(req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log("Error From Server - createNewClinic API !", e);
		return res.status(200).json({
			errCode: -1,
			errMessage: "Error From Server - createNewClinic API !",
		});
	}
};

let getAllClinic = async (req, res) => {
	try {
		let response = await clinicService.getAllClinic();
		return res.status(200).json(response);
	} catch (e) {
		console.log("Error From Server - getAllClinic API !", e);
		return res.status(200).json({
			errCode: -1,
			errMessage: "Error From Server - getAllClinic API !",
		});
	}
};

let getDetailsClinicById = async (req, res) => {
	try {
		let response = await clinicService.getDetailsClinicById(req.query.id);
		return res.status(200).json(response);
	} catch (e) {
		console.log("Error From Server - getAllSpecialty API !", e);
		return res.status(200).json({
			errCode: -1,
			errMessage: "Error From Server - getAllSpecialty API !",
		});
	}
};

module.exports = {
	createNewClinic: createNewClinic,
	getAllClinic: getAllClinic,
	getDetailsClinicById: getDetailsClinicById,
};
