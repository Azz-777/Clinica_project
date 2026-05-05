import { Request, Response } from "express";
import pool from "../src/db/db";

// GET /payments - Barcha to'lovlarni olish
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        pay.id,
        pay.app_id,
        pay.amount,
        pay.payment_method,
        pay.status,
        pay.paid_at,
        pay.created_at,
        pat.name   AS patient_name,
        pat.phone  AS patient_phone,
        doc.name   AS doctor_name,
        a.datetime AS appointment_date,
        a.reason   AS appointment_reason,
        pr.diagnos_desc,
        pr.doktor  AS prescription_doctor
      FROM payments pay
      JOIN appointments a   ON pay.app_id = a.id
      JOIN patients    pat  ON a.patient_id = pat.id
      JOIN doctors     doc  ON a.doctor_id  = doc.id
      LEFT JOIN prescriptions pr ON pr.app_id = a.id
      ORDER BY pay.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("getAllPayments error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /payments/:id - Bitta to'lovni olish
export const getPaymentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        pay.id,
        pay.app_id,
        pay.amount,
        pay.payment_method,
        pay.status,
        pay.paid_at,
        pay.created_at,
        pat.id     AS patient_id,
        pat.name   AS patient_name,
        pat.phone  AS patient_phone,
        pat.gender,
        pat.birth_date,
        doc.id     AS doctor_id,
        doc.name   AS doctor_name,
        a.datetime AS appointment_date,
        a.reason   AS appointment_reason,
        a.status   AS appointment_status,
        pr.diagnos_desc,
        pr.doktor  AS prescription_doctor
      FROM payments pay
      JOIN appointments a   ON pay.app_id = a.id
      JOIN patients    pat  ON a.patient_id = pat.id
      JOIN doctors     doc  ON a.doctor_id  = doc.id
      LEFT JOIN prescriptions pr ON pr.app_id = a.id
      WHERE pay.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "To'lov topilmadi" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("getPaymentById error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /payments/appointment/:app_id - Appointment bo'yicha to'lovni olish
export const getPaymentByAppointment = async (req: Request, res: Response) => {
  const { app_id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        pay.id,
        pay.app_id,
        pay.amount,
        pay.payment_method,
        pay.status,
        pay.paid_at,
        pay.created_at,
        pat.name   AS patient_name,
        pat.phone  AS patient_phone,
        doc.name   AS doctor_name,
        a.datetime AS appointment_date,
        a.reason   AS appointment_reason,
        pr.diagnos_desc
      FROM payments pay
      JOIN appointments a   ON pay.app_id = a.id
      JOIN patients    pat  ON a.patient_id = pat.id
      JOIN doctors     doc  ON a.doctor_id  = doc.id
      LEFT JOIN prescriptions pr ON pr.app_id = a.id
      WHERE pay.app_id = $1
      `,
      [app_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Bu appointment uchun to'lov topilmadi" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("getPaymentByAppointment error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// POST /payments - Yangi to'lov qo'shish
export const createPayment = async (req: Request, res: Response) => {
  const { app_id, amount, payment_method } = req.body;

  if (!app_id || !amount || !payment_method) {
    return res.status(400).json({
      success: false,
      message: "app_id, amount va payment_method majburiy maydonlar",
    });
  }

  const validMethods = ["cash", "card", "transfer"];
  if (!validMethods.includes(payment_method)) {
    return res.status(400).json({
      success: false,
      message: `payment_method faqat: ${validMethods.join(", ")} bo'lishi mumkin`,
    });
  }

  try {
    // Appointment mavjudligini tekshirish
    const apptCheck = await pool.query(
      "SELECT id FROM appointments WHERE id = $1",
      [app_id]
    );
    if (apptCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Appointment topilmadi" });
    }

    // Duplicate tekshirish
    const existing = await pool.query(
      "SELECT id FROM payments WHERE app_id = $1",
      [app_id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Bu appointment uchun to'lov allaqachon mavjud",
      });
    }

    const result = await pool.query(
      `INSERT INTO payments (app_id, amount, payment_method, status, paid_at, created_at)
       VALUES ($1, $2, $3, 'paid', NOW(), NOW())
       RETURNING *`,
      [app_id, amount, payment_method]
    );

    res.status(201).json({
      success: true,
      message: "To'lov muvaffaqiyatli qo'shildi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("createPayment error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

