import express, { Request, Response } from 'express';
import pool from '../src/db/db'; 
import * as dotenv from 'dotenv';
import AuthRouter from "../routes/auth.route";
import DoctorsRouter from "../routes/doctors.route";
import PatientsRouter from "../routes/patients.route";
import AppointmentsRouter from "../routes/appointments.route";
import PrescriptionsRouter from "../routes/prescriptions.route";
import PaymentsRouter from "../routes/payments.route";
import AdminRouter from "../routes/admin.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/auth', AuthRouter);
app.use('/api/doctors',DoctorsRouter); 
app.use('/api/patients', PatientsRouter);
app.use('/api/appointments', AppointmentsRouter);
app.use('/api/prescriptions', PrescriptionsRouter);
app.use('/api/payments', PaymentsRouter);
app.use('/api/admin', AdminRouter );



const checkConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log(' PostgreSQL bazasiga ulanish muvaffaqiyatli:', res.rows[0].now);
  } catch (err) {
    console.error('Bazaga ulanishda xatolik:', err);
  }
};

checkConnection();

app.get('/', (req: Request, res: Response) => {
  res.send('Klinika API ishlamoqda...');
});


app.listen(PORT, () => {
  console.log(` Server http://localhost:${PORT} manzilida ishga tushdi`);
});