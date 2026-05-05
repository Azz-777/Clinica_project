import { Router } from "express";
import {
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointment,
  deletePrescription,
} from "../controllers/prescriptions";
import { createPrescription } from "../controllers/admin";

const router = Router();

// GET /prescriptions            - Barcha retseptlar
router.get("/", getAllPrescriptions);

// GET /prescriptions/:id        - ID bo'yicha bitta retsept
router.get("/:id", getPrescriptionById);

// GET /prescriptions/appointment/:app_id  - Appointment bo'yicha retsept
router.get("/appointment/:app_id", getPrescriptionByAppointment);


// DELETE /prescriptions/:id     - Retseptni o'chirish
router.delete("/:id", deletePrescription);

export default router;