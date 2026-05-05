
import { Router } from "express";
import {
getAdminDashboard,
 getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor,
 getAllPatients, getPatientById, createPatient, updatePatient, deletePatient,
 getAllAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment,
 getAllPrescriptions, getPrescriptionById, createPrescription, updatePrescription, deletePrescription,
 getAllPayments, getPaymentById, createPayment, updatePayment, deletePayment,
 viewReports
} from "../controllers/admin";

const router = Router();

// Dashboard va Hisobotlar
router.get("/dashboard", getAdminDashboard);
router.get("/reports", viewReports);

// DOCTORS CRUD
router.get("/doctors", getAllDoctors);
router.get("/doctors/:id", getDoctorById);
router.post("/doctors", createDoctor);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

// PATIENTS CRUD
router.get("/patients", getAllPatients);
router.get("/patients/:id", getPatientById);
router.post("/patients", createPatient);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

// APPOINTMENTS CRUD
router.get("/appointments", getAllAppointments);
router.get("/appointments/:id", getAppointmentById);
router.post("/appointments", createAppointment);
router.put("/appointments/:id", updateAppointment);
router.delete("/appointments/:id", deleteAppointment);

// PRESCRIPTIONS CRUD
router.get("/prescriptions", getAllPrescriptions);
router.get("/prescriptions/:id", getPrescriptionById);
router.post("/prescriptions", createPrescription);
router.put("/prescriptions/:id", updatePrescription);
router.delete("/prescriptions/:id", deletePrescription);

// PAYMENTS CRUD
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);
router.post("/payments", createPayment);
router.put("/payments/:id", updatePayment);
router.delete("/payments/:id", deletePayment);

export default router;
