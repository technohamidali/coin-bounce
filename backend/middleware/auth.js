const UserDTO = require('../dto/user');
const {User} = require('../models/user');
const JWTService = require('../services/JWTService');

const createError = (status, message) => ({ status, message });

const auth = async (req, res, next) => {
    try {
        // 1. Validate refresh and access tokens
        const { refreshToken, accessToken } = req.cookies;
        if (!refreshToken || !accessToken) {
            return next(createError(401, 'Unauthorized'));
        }

        // 2. Verify access token
      
        let _id;
        try {
            const decoded = JWTService.verifyAccessToken(accessToken);
            _id = decoded._id;
        } catch (error) {
            return next(createError(401, 'Invalid access token'));
        }

        // 3. Fetch user from the database
        let user;
        try {
            user = await User.findOne({ _id });
            if (!user) {
                return next(createError(404, 'User not found'));
            }
        } catch (error) {
            return next(error);
        }

        // 4. Attach user DTO to the request
        const userDto = new UserDTO(user);
        req.user = userDto;
        next();
    } catch (error) {
        return next(error);
    }
};

module.exports = auth;
