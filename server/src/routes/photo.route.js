import { Router } from "express";
import {
	allPhoto,
	getPhoto,
	createPhoto,
	deletePhoto
} from "../controllers/photo.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

router.route("/all-photo").get(verifyJWT, allPhoto);

router.route("/get-photo/:id").get(verifyJWT, getPhoto);

router
	.route("/create")
	.post(verifyJWT,upload.single("image"), createPhoto);

// router.route("/update-data/:postId").patch(verifyJWT, isAdmin, updatePostData);

// router
// 	.route("/update-image/:postId")
// 	.patch(verifyJWT, isAdmin, upload.single("image"), updatePostImage);

router.route("/delete/:photoId").delete(verifyJWT,deletePhoto);


export default router;
