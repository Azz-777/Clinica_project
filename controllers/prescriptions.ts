import { Request, Response } from "express";
import pool from "../src/db/db";

// GET /prescriptions - Barcha retseptlarni olish
export const getAllPrescriptions = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.app_id,
        p.diagnos_desc,
        p.doktor,
        a.datetime AS appointment_date,
        a.status AS appointment_status,
        a.reason,
        pat.name AS patient_name,
        pat.phone AS patient_phone,
        doc.name AS doctor_name
      FROM prescriptions p
      JOIN appointments a ON p.app_id = a.id
      JOIN patients pat ON a.patient_id = pat.id
      JOIN doctors doc ON a.doctor_id = doc.id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("getAllPrescriptions error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /prescriptions/:id - Bitta retseptni olish
export const getPrescriptionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.app_id,
        p.diagnos_desc,
        p.doktor,
        a.datetime AS appointment_date,
        a.status AS appointment_status,
        a.reason,
        pat.id AS patient_id,
        pat.name AS patient_name,
        pat.phone AS patient_phone,
        pat.birth_date,
        pat.gender,
        pat.address,
        doc.id AS doctor_id,
        doc.name AS doctor_name
      FROM prescriptions p
      JOIN appointments a ON p.app_id = a.id
      JOIN patients pat ON a.patient_id = pat.id
      JOIN doctors doc ON a.doctor_id = doc.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Retsept topilmadi" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("getPrescriptionById error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /prescriptions/appointment/:app_id - Appointment bo'yicha retseptni olish
export const getPrescriptionByAppointment = async (req: Request, res: Response) => {
  const { app_id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        p.id,
        p.app_id,
        p.diagnos_desc,
        p.doktor,
        a.datetime AS appointment_date,
        a.status AS appointment_status,
        a.reason,
        pat.name AS patient_name,
        pat.phone AS patient_phone,
        doc.name AS doctor_name
      FROM prescriptions p
      JOIN appointments a ON p.app_id = a.id
      JOIN patients pat ON a.patient_id = pat.id
      JOIN doctors doc ON a.doctor_id = doc.id
      WHERE p.app_id = $1
      `,
      [app_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Bu appointment uchun retsept topilmadi" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("getPrescriptionByAppointment error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};


// DELETE /prescriptions/:id - Retseptni o'chirish
export const deletePrescription = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM prescriptions WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Retsept topilmadi" });
    }

    res.json({
      success: true,
      message: "Retsept muvaffaqiyatli o'chirildi",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("deletePrescription error:", error);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};