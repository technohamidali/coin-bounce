const Joi = require("joi");
const { User } = require("../models/user");
const bcryptjs = require("bcryptjs");
const UserDTO = require("../dto/user");
const JWTService = require("../services/JWTService");
const {RefreshToken} = require("../models/token");
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

const createError = (status, message) => ({ status, message });

const generateTokensAndSetCookies = async (user, res) => {
  const accessToken = JWTService.signAccessToken({ _id: user._id }, "30m");
  const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "60m");

  await JWTService.storeRefreshToken(refreshToken, user._id);

  res.cookie("accessToken", accessToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  });
  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  });

  return { accessToken, refreshToken };
};

const authController = {
  async register(req, res, next) {
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(12).required(),
      name: Joi.string().min(5).max(12).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPattern).required(),
      confirmPassword: Joi.ref("password"),
    });

    const { error } = userRegisterSchema.validate(req.body);

    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { username, name, email, password } = req.body;

    try {
      const emailInUse = await User.findOne({ email });
      const usernameInUse = await User.exists({ username });

      if (emailInUse) {
        return next(
          createError(409, "Email already registered. Try another email.")
        );
      }

      if (usernameInUse) {
        return next(
          createError(409, "Username not available. Choose another username.")
        );
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      const userToRegister = new User({
        username,
        email,
        name,
        password: hashedPassword,
      });
      const user = await userToRegister.save();

      if (!user || !user._id) {
        throw new Error("User registration failed");
      }

      await generateTokensAndSetCookies(user, res);

      const userDto = new UserDTO(user);
      return res.status(201).json({ user: userDto, auth: true });
    } catch (err) {
      return next(err);
    }
  },

  async login(req, res, next) {
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(12).required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });

    const { error } = userLoginSchema.validate(req.body);

    if (error) {
      return next(createError(400, error.details[0].message));
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });

      if (!user) {
        return next(createError(401, "Invalid username"));
      }

      const match = await bcryptjs.compare(password, user.password);

      if (!match) {
        return next(createError(401, "Invalid password"));
      }

      await generateTokensAndSetCookies(user, res);

      const userDto = new UserDTO(user);
      console.log(userDto);
      return res.status(200).json({ user: userDto, auth: true });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {
    // console.log(req);
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return next(createError(400, "Refresh token not found"));
    }

    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (err) {
      return next(err);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({ user: null, auth: false });
  },
  async refresh(req, res, next) {
    //1 get refresh token from cooies
    //2 verify refresh token
    //3 genrate new token
    //4 update db, return response
    const originalRefreshToken = req.cookies.refreshToken;
    let id;
    try {
      id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      const error = {
        status: 401,
        message: 'unauthorized'
      }
      return next(error);
    }
    try {
      const match = RefreshToken.findOne({ _id: id, token: originalRefreshToken });
      if (!match) {
        const error = {
          status: 401,
          message: 'unauthorized'
        }
        return next(error);
      }
    }
    catch (e) {
      return next(e);
    }
    try {
      const accessToken = JWTService.signAccessToken({ _id: id }, '30m');
      const refreshToken = JWTService.signRefreshToken({ _id: id }, '60m');
      await RefreshToken.updateOne({ _id: id }, { token: refreshToken });
      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });


    } catch (e) {
      return next(e);
    }
    const user = await User.findOne({ _id: id });
    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true });
  },

};

module.exports = authController;
