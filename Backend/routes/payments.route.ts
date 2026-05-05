import { Router } from "express";
import {
  getAllPayments,
  getPaymentById,
  getPaymentByAppointment,
  createPayment,
} from "../controllers/payments";

const router = Router();

// GET  /payments                          - Barcha to'lovlar
router.get("/", getAllPayments);

// GET  /payments/:id                      - ID bo'yicha bitta to'lov
router.get("/:id", getPaymentById);

// GET  /payments/appointment/:app_id      - Appointment bo'yicha to'lov
router.get("/appointment/:app_id", getPaymentByAppointment);

// POST /payments                          - Yangi to'lov qo'shish
router.post("/", createPayment);


export default router;