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
    try {
      if (
        !Inputdata.doctorId ||
        !Inputdata.contentHTML ||
        !Inputdata.contentMarkdown ||
        !Inputdata.action
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing Required Parameters !",
        });
      } else {
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
          ],
          raw: false,
          nest: true,
        });

        if (detailsDoctor && detailsDoctor.image) {
          detailsDoctor.image = new Buffer(
            detailsDoctor.image,
            "base64"
          ).toString("binary");
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
            return item;
          });
        }

        //get All Existing Schedules
        let existingSchedule = await db.Schedule.findAll({
          where: { doctorId: data.doctorId, date: data.date },
          attributes: ["timeType", "date", "doctorId", "maxNumber"],
          raw: true,
        });

        //convert date
        if (existingSchedule && existingSchedule.length > 0) {
          existingSchedule = existingSchedule.map((item) => {
            item.date = new Date(item.date).getTime();
            return item;
          });
        }

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

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctor: getAllDoctor,
  saveDetailsInfoDoctor: saveDetailsInfoDoctor,
  getDetailsDoctorById: getDetailsDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
};
