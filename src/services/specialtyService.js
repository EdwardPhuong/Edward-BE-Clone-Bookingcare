import db from "../models/index";

let createNewSpecialty = (inputData) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (
				!inputData.name ||
				!inputData.imageBase64 ||
				!inputData.descriptionHTML ||
				!inputData.descriptionMarkdown
			) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - createNewSpecialty !",
				});
			} else {
				await db.Specialty.create({
					name: inputData.name,
					image: inputData.imageBase64,
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

let getAllSpecialty = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let data = await db.Specialty.findAll();
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

let getDetailsSpecialtyById = (specialtyId, location) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!specialtyId || !location) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - getDetailsSpecialtyById API",
				});
			} else {
				let data = await db.Specialty.findOne({
					where: { id: specialtyId },
					attributes: ["descriptionHTML", "descriptionMarkdown"],
				});

				if (data) {
					let doctorSpecialty = [];
					if (location === "ALL") {
						doctorSpecialty = await db.Doctor_Info.findAll({
							where: { specialtyId: specialtyId },
							attributes: ["doctorId", "provinceId"],
						});
					} else {
						doctorSpecialty = await db.Doctor_Info.findAll({
							where: {
								specialtyId: specialtyId,
								provinceId: location,
							},
							attributes: ["doctorId", "provinceId"],
						});
					}
					data.doctorSpecialty = doctorSpecialty;
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
	createNewSpecialty: createNewSpecialty,
	getAllSpecialty: getAllSpecialty,
	getDetailsSpecialtyById: getDetailsSpecialtyById,
};
