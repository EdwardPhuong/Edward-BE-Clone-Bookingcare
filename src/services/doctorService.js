import { raw } from "body-parser";
import db from "../models/index";

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
        !Inputdata.contentMarkdown
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing Required Parameters !",
        });
      } else {
        await db.Markdown.create({
          contentMarkdown: Inputdata.contentMarkdown,
          contentHTML: Inputdata.contentHTML,
          description: Inputdata.description,
          doctorId: Inputdata.doctorId,
        });
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
          attributes: { exclude: ["password", "image"] },
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
          raw: true,
          nest: true,
        });
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

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getAllDoctor: getAllDoctor,
  saveDetailsInfoDoctor: saveDetailsInfoDoctor,
  getDetailsDoctorById: getDetailsDoctorById,
};
