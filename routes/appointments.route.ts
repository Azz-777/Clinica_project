// routes/appointments.route.ts
import { Router } from "express";
import {
    getAppointments,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
} from "../controllers/appointments";

const router = Router();

router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.patch("/:id/status", updateAppointmentStatus);  // faqat statusni yangilash uchun
export default router;