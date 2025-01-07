import { ApiError } from "../utils/ApiError.js";

const isAdmin = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		throw new ApiError(403, "Access denied");
	}
};

export { isAdmin };
