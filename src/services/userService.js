import db from "../models/index";
import bcrypt from "bcryptjs";

const salt = bcrypt.genSaltSync(10);

let handleUserLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        //user already existed
        let user = await db.User.findOne({
          attributes: ["email", "roleId", "password", "firstName", "lastName"],
          where: { email: email },
          raw: true,
        });
        if (user) {
          let check = await bcrypt.compareSync(password, user.password);
          if (check) {
            userData.errCode = 0;
            userData.errMessage = " Successfully !";
            delete user.password;
            userData.user = user;
          } else {
            userData.errCode = 3;
            userData.errMessage = " Incorrect Password !";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = "User not found !";
        }
      } else {
        //return error
        userData.errCode = 1;
        userData.errMessage = "Your's email do not exist !";
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};

let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllUsers = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = "";
      if (userId === "ALL") {
        user = db.User.findAll({
          attributes: {
            exclude: ["password"],
          },
        });
      }
      if (userId && userId !== "ALL") {
        user = await db.User.findOne({
          where: { id: userId },
          attributes: {
            exclude: ["password"],
          },
        });
      }
      resolve(user);
    } catch (e) {
      reject(e);
    }
  });
};

let hashUserPassword = (password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let hashPassword = await bcrypt.hashSync(password, salt);
      resolve(hashPassword);
    } catch (e) {
      reject(e);
    }
  });
};

let createNewUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check whether account existed or not
      let check = await checkUserEmail(data.email);

      if (check === true) {
        resolve({
          errCode: 1,
          errMessage: "Your email existed, please try other !",
        });
      } else {
        let hashPasswordFromBcrypt = await hashUserPassword(data.password);
        await db.User.create({
          email: data.email,
          password: hashPasswordFromBcrypt,
          firstName: data.firstName,
          lastName: data.lastName,
          address: data.address,
          phonenumber: data.phonenumber,
          gender: data.gender,
          position: data.positionId,
          roleId: data.roleId,
          image: data.avatar,
        });
        resolve({
          errCode: 0,
          message: "successfully created a new user !",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let editUser = (userData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !userData.id ||
        !userData.roleId ||
        !userData.position ||
        !userData.gender
      ) {
        resolve({
          errCode: 2,
          errMessage: "Missing require parameter !",
        });
      }
      let user = await db.User.findOne({
        where: { id: userData.id },
        raw: false,
      });
      if (user) {
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.address = userData.address;
        user.phonenumber = userData.phonenumber;
        user.roleId = userData.roleId;
        user.position = userData.position;
        user.gender = userData.gender;
        if (userData.avatar) {
          user.image = userData.avatar;
        }
        await user.save();
        resolve({
          errCode: 0,
          message: "Details change successfully !",
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Cannot Found User !",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      //check whether account existed or not
      let user = await db.User.findOne({
        where: { id: userId },
      });
      if (!user) {
        resolve({
          errCode: 2,
          errMessage: "User is not existed !",
        });
      } else {
        await db.User.destroy({
          where: { id: userId },
        });
        resolve({
          errCode: 0,
          message: "Successfully deleted user !",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getAllCodeService = (typeInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!typeInput) {
        resolve({
          errCode: 1,
          errMessage: "Missing Required Parameter !",
        });
      } else {
        let response = {};
        let allcode = await db.Allcode.findAll({
          where: { type: typeInput },
        });
        response.errCode = 0;
        response.data = allcode;
        resolve(response);
      }
    } catch (e) {
      reject(e);
    }
  });
};
module.exports = {
  handleUserLogin: handleUserLogin,
  getAllUsers: getAllUsers,
  createNewUser: createNewUser,
  editUser: editUser,
  deleteUser: deleteUser,
  getAllCodeService: getAllCodeService,
};
