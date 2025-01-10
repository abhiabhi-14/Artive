import { Router } from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	changeExistingPassword,
	updateUserFields,
	getUser,
	deleteUser,
	allUsers,
	adminDeleteUser,
} from "../controllers/user.controllers.js";
import {
	registrationSchema,
	loginSchema,
	updateUserSchema,
	changePasswordSchema,
} from "../utils/validators.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/register").post(validate(registrationSchema), registerUser);

router.route("/login").post(validate(loginSchema), loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/delete").delete(verifyJWT, deleteUser);

router.route("/all-users").get(verifyJWT, isAdmin, allUsers);

router.route("/generate-token").post(refreshAccessToken);

router
	.route("/change-password")
	.post(verifyJWT, validate(changePasswordSchema), changeExistingPassword);

router.route("/get-user").get(verifyJWT, getUser);

router
	.route("/update-user-details")
	.patch(verifyJWT, validate(updateUserSchema), updateUserFields);

router
	.route("/admin-delete/:userId")
	.delete(verifyJWT, isAdmin, adminDeleteUser);

export default router;
