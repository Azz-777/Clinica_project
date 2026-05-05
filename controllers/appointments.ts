// controllers/appointments.ts
import { Request, Response } from "express";
import pool from "../src/db/db";

// GET /appointments
export const getAppointments = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT a.id, a.datetime, a.status, a.reason, a.created_at,
                    p.name AS patient_name,
                    d.name AS doctor_name
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             ORDER BY a.datetime DESC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// GET /appointments/:id
export const getAppointmentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: "ID raqam bo'lishi kerak" });
        return;
    }
    try {
        const result = await pool.query(
            `SELECT a.id, a.datetime, a.status, a.reason, a.created_at,
                    p.name AS patient_name,
                    d.name AS doctor_name
             FROM appointments a
             LEFT JOIN patients p ON a.patient_id = p.id
             LEFT JOIN doctors d ON a.doctor_id = d.id
             WHERE a.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Uchrashuv topilmadi" });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// POST /appointments
export const createAppointment = async (req: Request, res: Response) => {
    const { patient_id, doctor_id, datetime, reason } = req.body;
    if (!patient_id || !doctor_id || !datetime) {
        res.status(400).json({ error: "patient_id, doctor_id va datetime majburiy" });
        return;
    }
    try {
        const result = await pool.query(
            `INSERT INTO appointments (patient_id, doctor_id, datetime, reason)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [patient_id, doctor_id, datetime, reason]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// PUT /appointments/:id - to'liq yangilash
export const updateAppointment = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: "ID raqam bo'lishi kerak" });
        return;
    }
    const { patient_id, doctor_id, datetime, reason } = req.body;
    if (!patient_id || !doctor_id || !datetime) {
        res.status(400).json({ error: "patient_id, doctor_id va datetime majburiy" });
        return;
    }
    try {
        const result = await pool.query(
            `UPDATE appointments
             SET patient_id=$1, doctor_id=$2, datetime=$3, reason=$4
             WHERE id=$5 RETURNING *`,
            [patient_id, doctor_id, datetime, reason, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Uchrashuv topilmadi" });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// PATCH /appointments/:id/status - faqat statusni yangilash
export const updateAppointmentStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: "ID raqam bo'lishi kerak" });
        return;
    }
    const { status } = req.body;
    if (!status || !["pending", "completed", "cancelled"].includes(status)) {
        res.status(400).json({ error: "status: pending, completed yoki cancelled bo'lishi kerak" });
        return;
    }
    try {
        const result = await pool.query(
            `UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *`,
            [status, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Uchrashuv topilmadi" });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// DELETE /appointments/:id
