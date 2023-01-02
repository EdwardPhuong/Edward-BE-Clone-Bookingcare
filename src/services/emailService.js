require("dotenv").config;
import nodemailer from "nodemailer";

let sendSimpleEmail = async (dataSend) => {
	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: process.env.EMAIL_APP,
			pass: process.env.EMAIL_APP_PASSWORD,
		},
	});

	let info = await transporter.sendMail({
		from: `"Simon Tora With Love" <simontora12102002@gmail.com>`,
		to: dataSend.recieverEmail,
		subject: "Thông Tin Đặt Lịch Khám Bệnh !",
		text: "Hello World !",
		html: getBodyHTMLEmail(dataSend),
	});
};

let getBodyHTMLEmail = (dataSend) => {
	let result = "";
	if (dataSend.language === "vi") {
		result = `<h3>Xin Chào ${dataSend.patientName} !</h3>
		<p>Bạn Nhận Được Email Này Vì Đã Đặt Lịch Khám Bệnh Online Trên Edward-Clone-Bookingcare</p>
		<p>Thông Tin Đặt Lịch Khám Bệnh: </p>
		<div><b>Thời Gian Đặt Lịch: ${dataSend.time}</b></div>
		<div><b>Bác Sĩ Chỉ Định: ${dataSend.doctorName}</b></div>
		<p>Nếu Các Thông Tin Trên Là Đúng Vui Lòng Click Vào Đường Link Bên Dưới Để Xác Nhận Và Hoàn Tất Thủ Tục Đặt Lịch Khám Bệnh</p>
		<div>
		<a href=${dataSend.redirectLink} target="_blank"> Click Here To Confirm !</a>
		</div>
		<div>Xin Chân Thành Cảm Ơn !</div>`;
	}

	if (dataSend.language === "en") {
		result = `<h3>Dear ${dataSend.patientName}</h3>
		<p>You recieved this email because you have booked an online appointment on Edward-Clone-Bookingcare</p>
		<p>Details of appointment: </p>
		<div><b>Appointment Time: ${dataSend.time}</b></div>
		<div><b>Assigned Doctor: ${dataSend.doctorName}</b></div>
		<p>If all the information provided above is exactly correct please click on the link below to confirm the appointment and complete the procedure of booking appointment</p>
		<div>
		<a href=${dataSend.redirectLink} target="_blank"> Click Here To Confirm !</a>
		</div>
		<div>Best Regard !</div>`;
	}

	return result;
};

let sendAttachment = async (dataSend) => {
	let transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: {
			user: process.env.EMAIL_APP,
			pass: process.env.EMAIL_APP_PASSWORD,
		},
	});

	let info = await transporter.sendMail({
		from: `"Simon Tora With Love" <simontora12102002@gmail.com>`,
		to: dataSend.email,
		subject: "Thông Tin Đặt Lịch Khám Bệnh !",
		text: "Hello World !",
		html: getBodyHTMLEmailRemedy(dataSend),
		attachments: [
			{
				filename: `Remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
				content: dataSend.imgBase64.split("base64,")[1],
				encoding: "base64",
			},
		],
	});
};

let getBodyHTMLEmailRemedy = (dataSend) => {
	let result = "";
	if (dataSend.language === "vi") {
		result = `<h3>Xin Chào ${dataSend.patientName} !</h3>
		<p>Bạn Nhận Được Email Này Vì Đã Hoàn Thành Khám Bệnh</p>
		<p>Thông Tin Dơn Thuốc Được Gửi Trong File Đính Kèm </p>
		<div>Xin Chân Thành Cảm Ơn !</div>`;
	}

	if (dataSend.language === "en") {
		result = `<h3>Dear ${dataSend.patientName}</h3>
		<p>You recieved this email because you have completed a medical check</p>
		<p>Details of remedy file is attached in attachment !</p>
		<div>Best Regard !</div>`;
	}

	return result;
};

module.exports = {
	sendSimpleEmail: sendSimpleEmail,
	sendAttachment: sendAttachment,
};
