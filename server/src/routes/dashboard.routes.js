import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { fetchDashboardData } from "../controllers/dashboard.controllers.js";

const router = Router();

router.route("/get").get(verifyJWT, isAdmin, fetchDashboardData);

export default router;
