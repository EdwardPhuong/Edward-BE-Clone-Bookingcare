import userService from "../services/userService";

let handleLogin = async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(500).json({
      errCode: 1,
      message: "All input fields required !",
    });
  }

  let userData = await userService.handleUserLogin(email, password);
  return res.status(200).json({
    errCode: userData.errCode,
    message: userData.errMessage,
    user: userData.user ? userData.user : {},
  });
};

let handleGetAllUsers = async (req, res) => {
  let id = req.query.id; //ALL, ID
  if (!id) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing Require Parameters",
      user: [],
    });
  }
  let users = await userService.getAllUsers(id);
  return res.status(200).json({
    errCode: 0,
    errMessage: "OK",
    users,
  });
};

let handleCreateNewUser = async (req, res) => {
  let newUser = await userService.createNewUser(req.body);
  return res.status(200).json(newUser);
};
let handleEditUser = async (req, res) => {
  let userData = req.body;
  let message = await userService.editUser(userData);
  return res.status(200).json(message);
};
let handleDeleteUser = async (req, res) => {
  let userId = req.body.id;
  if (!userId) {
    return res.status(200).json({
      errCode: 1,
      errMessage: "Missing Parameter",
    });
  }
  let message = await userService.deleteUser(userId);
  return res.status(200).json(message);
};

let getAllCode = async (req, res) => {
  try {
    let data = await userService.getAllCodeService(req.query.type);
    return res.status(200).json(data);
  } catch (e) {
    console.log("Get Allcode Error: ", e);
    return res.status(200).json({
      errCode: -1,
      errMessage: "Error From Server",
    });
  }
};

module.exports = {
  handleLogin: handleLogin,
  handleGetAllUsers: handleGetAllUsers,
  handleCreateNewUser: handleCreateNewUser,
  handleEditUser: handleEditUser,
  handleDeleteUser: handleDeleteUser,
  getAllCode: getAllCode,
};
