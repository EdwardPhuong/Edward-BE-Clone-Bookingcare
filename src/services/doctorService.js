import { raw } from "body-parser";
import _ from "lodash";

import db from "../models/index";
require("dotenv").config();

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHome = (limitInput) => {
	return new Promise(async (resolve, reject) => {
		try {
			let doctors = await db.User.findAll({
				limit: limitInput,
				where: { roleId: "R2" },
				order: [["createdAt", "DESC"]],
				attributes: { exclude: ["password"] },
				include: [
					{
						model: db.Allcode,
						as: "positionData",
						attributes: ["value_en", "value_vi"],
					},
					{
						model: db.Allcode,
						as: "genderData",
						attributes: ["value_en", "value_vi"],
					},
				],
				raw: true,
				nest: true,
			});
			resolve({
				errCode: 0,
				data: doctors,
			});
		} catch (e) {
			reject(e);
		}
	});
};

let getAllDoctor = () => {
	return new Promise(async (resolve, reject) => {
		try {
			let doctors = await db.User.findAll({
				where: { roleId: "R2" },
				attributes: {
					exclude: ["password", "image"],
				},
			});

			resolve({
				errCode: 0,
				data: doctors,
			});
		} catch (e) {
			reject(e);
		}
	});
};

let saveDetailsInfoDoctor = (Inputdata) => {
	return new Promise(async (resolve, reject) => {
		// let arrInput = Object.keys(Inputdata);
		// for (let i = 0; i < arrInput.length; i++) {
		// 	let check = Inputdata[arrInput[i]];
		// 	if (!check) {
		// 		console.log("Missing", arrInput[i]);
		// 	} else {
		// 		console.log("Success");
		// 	}
		// }
		try {
			if (
				!Inputdata.doctorId ||
				!Inputdata.contentHTML ||
				!Inputdata.contentMarkdown ||
				!Inputdata.action ||
				!Inputdata.selectedPrice ||
				!Inputdata.selectedPayment ||
				!Inputdata.selectedProvince ||
				!Inputdata.nameClinic ||
				!Inputdata.addressClinic
			) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters !",
				});
			} else {
				//upsert to table markdown
				if (Inputdata.action === "CREATE") {
					await db.Markdown.create({
						contentMarkdown: Inputdata.contentMarkdown,
						contentHTML: Inputdata.contentHTML,
						description: Inputdata.description,
						doctorId: Inputdata.doctorId,
					});
				} else if (Inputdata.action === "EDIT") {
					let doctorMarkdown = await db.Markdown.findOne({
						where: { doctorId: Inputdata.doctorId },
						raw: false,
					});
					if (doctorMarkdown) {
						doctorMarkdown.contentMarkdown = Inputdata.contentMarkdown;
						doctorMarkdown.contentHTML = Inputdata.contentHTML;
						doctorMarkdown.description = Inputdata.description;

						await doctorMarkdown.save();
					}
				}

				//upsert to doctor_info table
				let doctorInfo = await db.Doctor_Info.findOne({
					where: { doctorId: Inputdata.doctorId },
					raw: false,
				});
				if (doctorInfo) {
					//update
					doctorInfo.doctorId = Inputdata.doctorId;
					doctorInfo.priceId = Inputdata.selectedPrice;
					doctorInfo.paymentId = Inputdata.selectedPayment;
					doctorInfo.provinceId = Inputdata.selectedProvince;

					doctorInfo.nameClinic = Inputdata.nameClinic;
					doctorInfo.addressClinic = Inputdata.addressClinic;
					doctorInfo.note = Inputdata.note;
					await doctorInfo.save();
				} else {
					//create
					await db.Doctor_Info.create({
						doctorId: Inputdata.doctorId,
						priceId: Inputdata.selectedPrice,
						paymentId: Inputdata.selectedPayment,
						provinceId: Inputdata.selectedProvince,

						nameClinic: Inputdata.nameClinic,
						addressClinic: Inputdata.addressClinic,
						note: Inputdata.note,
					});
				}
				resolve({
					errCode: 0,
					errMessage: "Successfully Save Doctor Details !",
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let getDetailsDoctorById = (doctorId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!doctorId) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameter !",
				});
			} else {
				let detailsDoctor = await db.User.findOne({
					where: { id: doctorId },
					attributes: { exclude: ["password"] },
					include: [
						{
							model: db.Markdown,
							attributes: ["description", "contentHTML", "contentMarkdown"],
						},
						{
							model: db.Allcode,
							as: "positionData",
							attributes: ["value_en", "value_vi"],
						},
						{
							model: db.Doctor_Info,
							attributes: {
								exclude: ["id", "doctorId", "updateAt", "createAt"],
							},
							include: [
								{
									model: db.Allcode,
									as: "priceTypeData",
									attributes: ["value_vi", "value_en"],
								},
								{
									model: db.Allcode,
									as: "provinceTypeData",
									attributes: ["value_vi", "value_en"],
								},
								{
									model: db.Allcode,
									as: "paymentTypeData",
									attributes: ["value_vi", "value_en"],
								},
							],
						},
					],
					raw: false,
					nest: true,
				});

				if (detailsDoctor && detailsDoctor.image) {
					detailsDoctor.image = new Buffer(detailsDoctor.image, "base64").toString(
						"binary"
					);
				}

				if (!detailsDoctor) detailsDoctor = {};

				resolve({
					errCode: 0,
					data: detailsDoctor,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let bulkCreateSchedule = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!data.arrSchedule || !data.doctorId || !data.date) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - bulkCreateSchedule !",
				});
			} else {
				let schedule = data.arrSchedule;
				if (schedule && schedule.length > 0) {
					schedule = schedule.map((item) => {
						item.maxNumber = MAX_NUMBER_SCHEDULE;
						item.date = String(item.date);
						return item;
					});
				}

				//get All Existing Schedules
				let existingSchedule = await db.Schedule.findAll({
					where: { doctorId: data.doctorId, date: data.date },
					attributes: ["timeType", "date", "doctorId", "maxNumber"],
					raw: true,
				});

				//compare differences
				let toCreate = _.differenceWith(schedule, existingSchedule, (a, b) => {
					return a.timeType === b.timeType && a.date === b.date;
				});

				//create data
				if (toCreate && toCreate.length > 0) {
					await db.Schedule.bulkCreate(toCreate);
				}

				resolve({
					errCode: 0,
					errMessage: "Successfully bulkCreate ! ",
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let getScheduleDoctorByDate = (doctorId, date) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!doctorId || !date) {
				resolve({
					errCode: 1,
					errMessage: "Missing required parameters - getScheduleDoctorByDate !",
				});
			} else {
				let dataSchedule = await db.Schedule.findAll({
					where: { doctorId: doctorId, date: date },
					include: [
						{
							model: db.Allcode,
							as: "timeTypeData",
							attributes: ["value_en", "value_vi"],
						},
					],
					raw: false,
					nest: true,
				});

				if (!dataSchedule) dataSchedule = [];
				resolve({
					errCode: 0,
					errMessage: "Successfully getScheduleDoctorByDate",
					data: dataSchedule,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	getTopDoctorHome: getTopDoctorHome,
	getAllDoctor: getAllDoctor,
	saveDetailsInfoDoctor: saveDetailsInfoDoctor,
	getDetailsDoctorById: getDetailsDoctorById,
	bulkCreateSchedule: bulkCreateSchedule,
	getScheduleDoctorByDate: getScheduleDoctorByDate,
};
