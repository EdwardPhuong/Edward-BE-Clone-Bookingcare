import specialtyService from "../services/specialtyService";

let createNewSpecialty = async (req, res) => {
	try {
		let response = await specialtyService.createNewSpecialty(req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log("Error From Server - createNewSpecialty API !", e);
		return res.status(200).json({
			errCode: -1,
			errMessage: "Error From Server - createNewSpecialty API !",
		});
	}
};

let getAllSpecialty = async (req, res) => {
	try {
		let response = await specialtyService.getAllSpecialty();
		return res.status(200).json(response);
	} catch (e) {
		console.log("Error From Server - getAllSpecialty API !", e);
		return res.status(200).json({
			errCode: -1,
			errMessage: "Error From Server - getAllSpecialty API !",
		});
	}
};

let getDetailsSpecialtyById = async (req, res) => {
	try {
		let response = await specialtyService.getDetailsSpecialtyById(
			req.query.id,
			req.query.location
		);
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
	createNewSpecialty: createNewSpecialty,
	getAllSpecialty: getAllSpecialty,
	getDetailsSpecialtyById: getDetailsSpecialtyById,
};
