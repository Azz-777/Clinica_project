import { Router } from "express";
import {
  getAllPayments,
  getPaymentById,
  getPaymentByAppointment,
  createPayment,
} from "../controllers/payments";

const router = Router();

router.get("/", getAllPayments);

router.get("/:id", getPaymentById);

router.get("/appointment/:app_id", getPaymentByAppointment);

router.post("/", createPayment);


export default router;