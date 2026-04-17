// ─── FIXED: member.route.js ──────────────────────────────
//
// BUG: ALL routes had isAdmin middleware, including GET /all-members.
// The frontend public Members page calls getAllMembers as a regular logged-in user,
// which would always receive 403 Forbidden.
//
// FIX:
//   - GET  /all-members        → verifyJWT only (any logged-in user can view members)
//   - GET  /get-member         → verifyJWT + isAdmin (fetches current admin's own profile)
//   - PATCH /update            → verifyJWT + isAdmin (admin updates their own member profile)
//   - POST /upload-profile-photo   → verifyJWT + isAdmin
//   - PATCH /replace-profile-photo → verifyJWT + isAdmin
// ─────────────────────────────────────────────────────────

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
	getAllMembers,
	getMember,
	updateMember,
	uploadProfilePhoto,
	replaceProfilePhoto,
	createMember,
} from "../controllers/member.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// FIX: removed isAdmin — any authenticated user can view public member list
router.route("/all-members").get(verifyJWT, getAllMembers);

// These remain admin-only (managing own member profile)
router
  .route("/create")
  .post(verifyJWT, isAdmin, upload.single("profilePhoto"), createMember);
router.route("/get-member").get(verifyJWT, isAdmin, getMember);
router.route("/update").patch(verifyJWT, isAdmin, updateMember);
router.route("/upload-profile-photo").post(verifyJWT, isAdmin, upload.single("profilePhoto"), uploadProfilePhoto);
router.route("/replace-profile-photo").patch(verifyJWT, isAdmin, upload.single("profilePhoto"), replaceProfilePhoto);

export default router;
