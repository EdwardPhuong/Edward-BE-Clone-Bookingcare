import { raw } from "body-parser";
import _ from "lodash";

import db from "../models/index";
import emailService from "../services/emailService";
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

let checkRequireFields = (Inputdata) => {
	let arrInput = Object.keys(Inputdata);
	let isValid = true;
	let element = "";
	for (let i = 0; i < arrInput.length; i++) {
		let check = Inputdata[arrInput[i]];
		if (!check) {
			console.log("Missing Parameter", arrInput[i]);
			isValid = false;
			element = arrInput[i];
			break;
		}
	}
	return isValid, element;
};

let saveDetailsInfoDoctor = (Inputdata) => {
	return new Promise(async (resolve, reject) => {
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
				!Inputdata.addressClinic ||
				!Inputdata.specialtyId
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
					doctorInfo.specialtyId = Inputdata.specialtyId;
					doctorInfo.clinicId = Inputdata.clinicId;
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
						specialtyId: Inputdata.specialtyId,
						clinicId: Inputdata.clinicId,
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
					detailsDoctor.image = Buffer.from(detailsDoctor.image, "base64").toString(
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
						{
							model: db.User,
							as: "doctorData",
							attributes: ["firstName", "lastName"],
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

let getExtraInfoDoctorById = (doctorId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!doctorId) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameter - doctorId !",
				});
			} else {
				let data = await db.Doctor_Info.findOne({
					where: { doctorId: doctorId },
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
					raw: false,
					nest: true,
				});
				if (!data) data = {};
				resolve({
					errCode: 0,
					data,
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let getProfileDoctorById = (doctorId) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!doctorId) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - getProfileDoctorById API",
				});
			} else {
				let detailsDoctor = await db.User.findOne({
					where: { id: doctorId },
					attributes: { exclude: ["password"] },
					include: [
						{
							model: db.Markdown,
							attributes: ["description"],
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
					detailsDoctor.image = Buffer.from(detailsDoctor.image, "base64").toString(
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

let getListPatientForDoctor = (doctorId, date) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!doctorId || !date) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - getListPatientForDoctor API",
				});
			} else {
				let data = await db.Booking.findAll({
					where: { doctorId: doctorId, date: date, statusId: "S2" },
					include: [
						{
							model: db.User,
							as: "patientData",
							attributes: ["email", "firstName", "address", "phoneNumber", "gender"],

							include: [
								{
									model: db.Allcode,
									as: "genderData",
									attributes: ["value_vi", "value_en"],
								},
							],
						},

						{
							model: db.Allcode,
							as: "timeTypeDataPatient",
							attributes: ["value_vi", "value_en"],
						},
					],
					raw: false,
					nest: true,
				});
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

let sendRemedy = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!data.email || !data.doctorId || !data.patientId || !data.timeType) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - sendRemedy API",
				});
			} else {
				//update patient status
				let appointment = await db.Booking.findOne({
					where: {
						doctorId: data.doctorId,
						patientId: data.patientId,
						timeType: data.timeType,
						statusId: "S2",
					},
					raw: false,
				});
				if (appointment) {
					appointment.statusId = "S3";
					await appointment.save();
				}

				//send email remedy
				await emailService.sendAttachment(data);
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

module.exports = {
	getTopDoctorHome: getTopDoctorHome,
	getAllDoctor: getAllDoctor,
	saveDetailsInfoDoctor: saveDetailsInfoDoctor,
	getDetailsDoctorById: getDetailsDoctorById,
	bulkCreateSchedule: bulkCreateSchedule,
	getScheduleDoctorByDate: getScheduleDoctorByDate,
	getExtraInfoDoctorById: getExtraInfoDoctorById,
	getProfileDoctorById: getProfileDoctorById,
	getListPatientForDoctor: getListPatientForDoctor,
	sendRemedy: sendRemedy,
};
