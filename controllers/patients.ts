// controllers/patients.ts
import { Request, Response } from "express";
import pool from "../src/db/db";

// GET /patients
export const getPatients = async (req: Request, res: Response) => {
    try {
        const result = await pool.query("SELECT * FROM patients ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// GET /patients/:id
export const getPatientById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: "ID raqam bo'lishi kerak" });
        return;
    }
    try {
        const result = await pool.query(
            "SELECT * FROM patients WHERE id = $1", [id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Bemor topilmadi" });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// POST /patients
export const createPatient = async (req: Request, res: Response) => {
    const { name, phone, birth_date, gender, address } = req.body;
    if (!name) {
        res.status(400).json({ error: "name majburiy" });
        return;
    }
    try {
        const result = await pool.query(
            `INSERT INTO patients (name, phone, birth_date, gender, address)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, phone, birth_date, gender, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// PUT /patients/:id
export const updatePatient = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: "ID raqam bo'lishi kerak" });
        return;
    }
    const { name, phone, birth_date, gender, address } = req.body;
    if (!name) {
        res.status(400).json({ error: "name majburiy" });
        return;
    }
    try {
        const result = await pool.query(
            `UPDATE patients 
             SET name=$1, phone=$2, birth_date=$3, gender=$4, address=$5
             WHERE id=$6 RETURNING *`,
            [name, phone, birth_date, gender, address, id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Bemor topilmadi" });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// DELETE /patients/:id
export const deletePatient = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: "ID raqam bo'lishi kerak" });
        return;
    }
    try {
        const result = await pool.query(
            "DELETE FROM patients WHERE id=$1 RETURNING *", [id]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Bemor topilmadi" });
        } else {
            res.json({ message: "Bemor o'chirildi" });
        }
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};

// GET /patients/:id/appointments
export const getPatientAppointments = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (isNaN(Number(id))) {
        res.status(400).json({ error: "ID raqam bo'lishi kerak" });
        return;
    }
    try {
        const result = await pool.query(
            `SELECT a.id, a.datetime,
                    d.name AS doctor_name
             FROM appointments a
             LEFT JOIN doctors d ON a.doctor_id = d.id
             WHERE a.patient_id = $1
             ORDER BY a.datetime DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
};