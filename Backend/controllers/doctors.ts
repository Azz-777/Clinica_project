import { Request, Response } from "express";
import pool from "../src/db/db";

export const getDoctors = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM doctors');
        res.json(result.rows);
    } catch (err) {
        console.error('Xatolik:', err);
        res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
    }
};

export const getDoctorById = async (req: Request, res: Response) => {
    const doctorId = req.params.id;
    if (isNaN(Number(doctorId))) {
        res.status(400).json({ error: 'ID raqam bolishi kerak' });
        return;
    }
    try {
        const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [doctorId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Doktor topilmadi' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Xatolik:', err);
        res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
    }
};

export const createDoctor = async (req: Request, res: Response) => {
    const { name, specialty } = req.body;
    if (!name || !specialty) {
        res.status(400).json({ error: 'Name va specialty majburiy' });
        return;
    }
    try {
        const result = await pool.query(
            'INSERT INTO doctors (name, specialty) VALUES ($1, $2) RETURNING *',
            [name, specialty]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Xatolik:', err);
        res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
    }
};

export const updateDoctor = async (req: Request, res: Response) => {
    const doctorId = req.params.id;
    if (isNaN(Number(doctorId))) {
        res.status(400).json({ error: 'ID raqam bolishi kerak' });
        return;
    }
    const { name, specialty } = req.body;
    if (!name || !specialty) {
        res.status(400).json({ error: 'Name va specialty majburiy' });
        return;
    }
    try {
        const result = await pool.query(
            'UPDATE doctors SET name = $1, specialty = $2 WHERE id = $3 RETURNING *',
            [name, specialty, doctorId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Doktor topilmadi' });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Xatolik:', err);
        res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
    }
};

export const deleteDoctor = async (req: Request, res: Response) => {
    const doctorId = req.params.id;
    if (isNaN(Number(doctorId))) {
        res.status(400).json({ error: 'ID raqam bolishi kerak' });
        return;
    }
    try {
        const result = await pool.query(
            'DELETE FROM doctors WHERE id = $1 RETURNING *',
            [doctorId]
        );
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Doktor topilmadi' });
        } else {
            res.json({ message: "Doktor muvaffaqiyatli o'chirildi" });
        }
    } catch (err) {
        console.error('Xatolik:', err);
        res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
    }
};