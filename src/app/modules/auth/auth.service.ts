import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../user/user.model";
import config from "../../config/config";
import { throwError } from "../../utils/response";

const loginUserService = async (userData: any) => {
  const query = {
    $or: [
      { phoneNumber: userData.id },
      { email: userData.id },
      { userName: userData.id },
    ],
    isDeleted: false,
  };

  const user = await userModel
    .findOne(query)
    .select(
      "_id firstName lastName userName email phoneNumber password status"
    );

  if (!user) {
    return throwError("User not found!", 404);
  }

  if (!user.status) {
    return throwError("User is not active. Please contact support!", 400);
  }

  const isPasswordCorrect = await bcrypt.compare(
    userData.password,
    user.password
  );

  if (!isPasswordCorrect) {
    return throwError("Password is incorrect!", 400);
  }

  const expirationTime = Math.floor(Date.now() / 1000 + 7 * 24 * 60 * 60);

  const jwtPayload = {
    _id: user._id,
    id: user.phoneNumber || user.email || user.userName,
    exp: expirationTime,
  };

  const token = jwt.sign(jwtPayload, config.jwt_access_secret as string);

  return {
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userName: user.userName,
    },
    token,
  };
};

export const authServices = {
  loginUserService,
};
