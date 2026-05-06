import { Request, Response } from "express";
import pool from "../src/db/db";
import jwt from "jsonwebtoken";

const DEFAULT_CASHIER_LOGIN = "cashier";
const DEFAULT_CASHIER_PASSWORD = "cashier";

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

export const cashierLogin = async (req: Request, res: Response) => {
    const { login, psw } = req.body;

    if (!login || !psw) {
        res.status(400).json({ error: "Login va parol kiritilishi shart" });
        return;
    }

    try {
        let result = await pool.query(
            "SELECT id, login FROM cashiers WHERE login = $1 AND psw = $2",
            [login, psw]
        );

        if (
            result.rows.length === 0 &&
            login === DEFAULT_CASHIER_LOGIN &&
            psw === DEFAULT_CASHIER_PASSWORD
        ) {
            const existingDefault = await pool.query(
                "SELECT id, login FROM cashiers WHERE login = $1",
                [DEFAULT_CASHIER_LOGIN]
            );

            if (existingDefault.rows.length === 0) {
                result = await pool.query(
                    "INSERT INTO cashiers (login, psw) VALUES ($1, $2) RETURNING id, login",
                    [DEFAULT_CASHIER_LOGIN, DEFAULT_CASHIER_PASSWORD]
                );
            } else {
                result = await pool.query(
                    "UPDATE cashiers SET psw = $1 WHERE login = $2 RETURNING id, login",
                    [DEFAULT_CASHIER_PASSWORD, DEFAULT_CASHIER_LOGIN]
                );
            }
        }

        if (result.rows.length === 0) {
            res.status(401).json({ error: "Noto'g'ri cashier login yoki parol" });
            return;
        }

        const cashier = result.rows[0];
        const token = process.env.JWT_SECRET
            ? jwt.sign({ id: cashier.id, username: cashier.login, role: "cashier" }, process.env.JWT_SECRET, { expiresIn: "2h" })
            : null;

        res.json({
            message: "Cashier panelga muvaffaqiyatli kirildi",
            user: {
                id: cashier.id,
                username: cashier.login,
                role: "cashier",
            },
            token,
        });
    } catch (err) {
        console.error("Cashier login xatoligi:", err);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
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
