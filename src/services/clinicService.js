import db from "../models";

let createNewClinic = (inputData) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (
				!inputData.name ||
				!inputData.address ||
				!inputData.imageBase64 ||
				!inputData.descriptionHTML ||
				!inputData.descriptionMarkdown
			) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - createNewClinic !",
				});
			} else {
				await db.Clinic.create({
					name: inputData.name,
					image: inputData.imageBase64,
					address: inputData.address,
					descriptionHTML: inputData.descriptionHTML,
					descriptionMarkdown: inputData.descriptionMarkdown,
				});

				resolve({
					errCode: 0,
					errMessage: "Successfully !",
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let getAllClinic = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let data = await db.Clinic.findAll();
			if (data && data.length > 0) {
				data.map((item) => {
					item.image = Buffer.from(item.image, "base64").toString("binary");
					return item;
				});
			}
			resolve({
				errCode: 0,
				errMessage: "Successfully !",
				data,
			});
		} catch (e) {
			reject(e);
		}
	});
};

let getDetailsClinicById = (inputId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!inputId) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - getDetailsClinicById API",
				});
			} else {
				let data = await db.Clinic.findOne({
					where: { id: inputId },
					attributes: ["descriptionHTML", "descriptionMarkdown", "address", "name"],
				});

				if (data) {
					let doctorClinic = [];

					doctorClinic = await db.Doctor_Info.findAll({
						where: { clinicId: inputId },
						attributes: ["doctorId", "provinceId"],
					});
					data.doctorClinic = doctorClinic;
				} else {
					data = {};
				}
				resolve({
					errCode: 0,
					errMessage: "Successfully !",
					data,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	createNewClinic: createNewClinic,
	getAllClinic: getAllClinic,
	getDetailsClinicById: getDetailsClinicById,
};
