import db from "../models/index";
require("dotenv").config();
import { v4 as uuidv4 } from "uuid";

import emailService from "../services/emailService";

let buildUrlEmail = (doctorId, token) => {
	let result = `${process.env.URL_REACT}/verify-booking?token=${token}&doctorId=${doctorId}`;
	return result;
};

let postBookAppointment = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (
				!data.email ||
				!data.doctorId ||
				!data.timeType ||
				!data.date ||
				!data.fullName ||
				!data.selectedGender ||
				!data.address ||
				!data.phoneNumber
			) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - postBookAppointment !",
				});
			} else {
				let token = uuidv4();
				await emailService.sendSimpleEmail({
					recieverEmail: data.email,
					patientName: data.fullName,
					time: data.timeString,
					doctorName: data.doctorName,
					language: data.language,
					redirectLink: buildUrlEmail(data.doctorId, token),
				});
				//upsert patient information and account
				let user = await db.User.findOrCreate({
					where: { email: data.email },
					defaults: {
						email: data.email,
						roleId: "R3",
						address: data.address,
						gender: data.selectedGender,
						phonenumber: data.phoneNumber,
						firstName: data.fullName,
					},
				});
				//create a booking appointment record
				if (user && user[0]) {
					await db.Booking.findOrCreate({
						where: { patientId: user[0].id },
						defaults: {
							statusId: "S1",
							doctorId: data.doctorId,
							patientId: user[0].id,
							date: data.date,
							timeType: data.timeType,
							token: token,
						},
					});
				}
				resolve({
					errCode: 0,
					errMessage: "Successfully postBookAppointment!",
				});
			}
		} catch (e) {
			reject(e);
		}
	});
};

let postVerifyBookAppointment = (data) => {
	return new Promise(async (resolve, reject) => {
		try {
			if (!data.token || !data.doctorId) {
				resolve({
					errCode: 1,
					errMessage: "Missing Required Parameters - postVerifyBookAppointment !",
				});
			} else {
				let appointment = await db.Booking.findOne({
					where: { token: data.token, doctorId: data.doctorId, statusId: "S1" },
					raw: false,
				});

				if (appointment) {
					appointment.statusId = "S2";
					await appointment.save();
					resolve({
						errCode: 0,
						errMessage: "Update appointment successfully !",
					});
				} else {
					resolve({
						errCode: 2,
						errMessage: "Appointment has been activated or does not exist !",
					});
				}
			}
		} catch (e) {
			reject(e);
		}
	});
};

module.exports = {
	postBookAppointment: postBookAppointment,
	postVerifyBookAppointment: postVerifyBookAppointment,
};
