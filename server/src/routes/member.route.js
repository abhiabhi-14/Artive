import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
    getAllMembers,
    getMember,
    updateMember,
    uploadProfilePhoto,
    replaceProfilePhoto,
} from "../controllers/member.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/all-members").get(verifyJWT, isAdmin, getAllMembers);

router.route("/get-member").get(verifyJWT, isAdmin, getMember);

router.route("/update").patch(verifyJWT, isAdmin, updateMember);

router.route("/upload-profile-photo").post(verifyJWT,isAdmin, upload.single("profilePhoto"), uploadProfilePhoto);

router.route("/replace-profile-photo").patch(verifyJWT,isAdmin, upload.single("profilePhoto"), replaceProfilePhoto);

export default router;