import { Request, Response } from "express";
import pool from "../src/db/db";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Username va parol kiritilishi shart" });
        return;
    }

    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, password]
        );

        const user = result.rows[0];
        const token = process.env.JWT_SECRET
            ? jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' })
            : null;

        res.status(201).json({
            message: "Foydalanuvchi muvaffaqiyatli yaratildi",
            user,
            token,
        });

    } catch (err: any) {
        console.error('Xatolik:', err);

        if (err.code === "23505") {
            res.status(409).json({ error: "Bu username allaqachon band" });
            return;
        }

        res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: "Username va parol kiritilishi shart" });
        return;
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length === 0) {
            res.status(401).json({ error: "Noto'g'ri username yoki parol" });
            return;
        }

        const user = result.rows[0];
        const token = process.env.JWT_SECRET
            ? jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '2h' })
            : null;

        res.json({
            message: "Muvaffaqiyatli login",
            user,
            token,
        });

    } catch (err) {
        console.error('Xatolik:', err);
        res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
    }
};