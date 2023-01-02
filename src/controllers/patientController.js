import patientService from "../services/patientService";

let postBookAppointment = async (req, res) => {
	try {
		let response = await patientService.postBookAppointment(req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log("Error From Server - postBookAppointment API !", e);
		return res.status(200).json({
			errCode: -1,
			errMessage: "Error From Server - postBookAppointment API !",
		});
	}
};

let postVerifyBookAppointment = async (req, res) => {
	try {
		let response = await patientService.postVerifyBookAppointment(req.body);
		return res.status(200).json(response);
	} catch (e) {
		console.log("Error From Server - postBookAppointment API !", e);
		return res.status(200).json({
			errCode: -1,
			errMessage: "Error From Server - postBookAppointment API !",
		});
	}
};

module.exports = {
	postBookAppointment: postBookAppointment,
	postVerifyBookAppointment: postVerifyBookAppointment,
};
