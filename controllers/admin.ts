import { Request, Response } from "express";
import pool from "../src/db/db";

// =============================================
// GET /admin/dashboard - Statistika
// =============================================
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const doctors      = await pool.query("SELECT COUNT(*) FROM doctors");
    const patients     = await pool.query("SELECT COUNT(*) FROM patients");
    const appointments = await pool.query("SELECT COUNT(*) FROM appointments");
    const prescriptions = await pool.query("SELECT COUNT(*) FROM prescriptions");
    const payments     = await pool.query("SELECT COUNT(*) FROM payments");
    const totalRevenue = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'"
    );
    const pendingAppointments = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE status = 'pending'"
    );
    const completedAppointments = await pool.query(
      "SELECT COUNT(*) FROM appointments WHERE status = 'completed'"
    );

    res.json({
      success: true,
      message: "Admin dashboardga xush kelibsiz!",
      stats: {
        doctors:              parseInt(doctors.rows[0].count),
        patients:             parseInt(patients.rows[0].count),
        appointments:         parseInt(appointments.rows[0].count),
        prescriptions:        parseInt(prescriptions.rows[0].count),
        payments:             parseInt(payments.rows[0].count),
        totalRevenue:         parseFloat(totalRevenue.rows[0].total),
        pendingAppointments:  parseInt(pendingAppointments.rows[0].count),
        completedAppointments: parseInt(completedAppointments.rows[0].count),
      },
    });
  } catch (err) {
    console.error("Dashboard xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// =============================================
// DOCTORS CRUD
// =============================================

// GET /admin/doctors
export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM doctors ORDER BY id DESC"
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllDoctors xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /admin/doctors/:id
export const getDoctorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name FROM doctors WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Doktor topilmadi" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getDoctorById xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// POST /admin/doctors
export const createDoctor = async (req: Request, res: Response) => {
  const { name, psw } = req.body;
  if (!name || !psw)
    return res.status(400).json({ success: false, message: "name va psw majburiy" });

  try {
    const result = await pool.query(
      "INSERT INTO doctors (name, psw) VALUES ($1, $2) RETURNING id, name",
      [name, psw]
    );
    res.status(201).json({
      success: true,
      message: "Doktor muvaffaqiyatli qo'shildi",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createDoctor xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// PUT /admin/doctors/:id
export const updateDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, psw } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM doctors WHERE id = $1", [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: "Doktor topilmadi" });

    const current = existing.rows[0];
    const result = await pool.query(
      "UPDATE doctors SET name = $1, psw = $2 WHERE id = $3 RETURNING id, name",
      [name ?? current.name, psw ?? current.psw, id]
    );
    res.json({
      success: true,
      message: "Doktor yangilandi",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateDoctor xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// DELETE /admin/doctors/:id
export const deleteDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM doctors WHERE id = $1 RETURNING id, name",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Doktor topilmadi" });

    res.json({
      success: true,
      message: "Doktor o'chirildi",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("deleteDoctor xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// =============================================
// PATIENTS CRUD
// =============================================

// GET /admin/patients
export const getAllPatients = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM patients ORDER BY id DESC");
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllPatients xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /admin/patients/:id
export const getPatientById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM patients WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Bemor topilmadi" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getPatientById xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// POST /admin/patients
export const createPatient = async (req: Request, res: Response) => {
  const { name, phone, birth_date, gender, address } = req.body;
  if (!name)
    return res.status(400).json({ success: false, message: "name majburiy" });

  try {
    const result = await pool.query(
      `INSERT INTO patients (name, phone, birth_date, gender, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, phone ?? null, birth_date ?? null, gender ?? null, address ?? null]
    );
    res.status(201).json({
      success: true,
      message: "Bemor qo'shildi",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createPatient xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// PUT /admin/patients/:id
export const updatePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, birth_date, gender, address } = req.body;

  try {
    const existing = await pool.query("SELECT * FROM patients WHERE id = $1", [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: "Bemor topilmadi" });

    const c = existing.rows[0];
    const result = await pool.query(
      `UPDATE patients SET name=$1, phone=$2, birth_date=$3, gender=$4, address=$5
       WHERE id=$6 RETURNING *`,
      [
        name       ?? c.name,
        phone      ?? c.phone,
        birth_date ?? c.birth_date,
        gender     ?? c.gender,
        address    ?? c.address,
        id,
      ]
    );
    res.json({ success: true, message: "Bemor yangilandi", data: result.rows[0] });
  } catch (err) {
    console.error("updatePatient xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// DELETE /admin/patients/:id
export const deletePatient = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM patients WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Bemor topilmadi" });

    res.json({ success: true, message: "Bemor o'chirildi", data: result.rows[0] });
  } catch (err) {
    console.error("deletePatient xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// =============================================
// APPOINTMENTS CRUD
// =============================================

// GET /admin/appointments
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        d.name AS doctor_name,
        p.name AS patient_name,
        p.phone AS patient_phone
      FROM appointments a
      LEFT JOIN doctors  d ON a.doctor_id  = d.id
      LEFT JOIN patients p ON a.patient_id = p.id
      ORDER BY a.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllAppointments xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /admin/appointments/:id
export const getAppointmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, d.name AS doctor_name, p.name AS patient_name
       FROM appointments a
       LEFT JOIN doctors  d ON a.doctor_id  = d.id
       LEFT JOIN patients p ON a.patient_id = p.id
       WHERE a.id = $1`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Appointment topilmadi" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getAppointmentById xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// POST /admin/appointments
export const createAppointment = async (req: Request, res: Response) => {
  const { patient_id, doctor_id, datetime, reason } = req.body;
  if (!patient_id || !doctor_id || !datetime)
    return res.status(400).json({
      success: false,
      message: "patient_id, doctor_id va datetime majburiy",
    });

  try {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, datetime, reason, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [patient_id, doctor_id, datetime, reason ?? null]
    );
    res.status(201).json({
      success: true,
      message: "Appointment qo'shildi",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createAppointment xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// PUT /admin/appointments/:id
export const updateAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { patient_id, doctor_id, datetime, reason, status } = req.body;

  const validStatuses = ["pending", "completed", "cancelled"];
  if (status && !validStatuses.includes(status))
    return res.status(400).json({
      success: false,
      message: `status faqat: ${validStatuses.join(", ")} bo'lishi mumkin`,
    });

  try {
    const existing = await pool.query(
      "SELECT * FROM appointments WHERE id = $1",
      [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: "Appointment topilmadi" });

    const c = existing.rows[0];
    const result = await pool.query(
      `UPDATE appointments
       SET patient_id=$1, doctor_id=$2, datetime=$3, reason=$4, status=$5
       WHERE id=$6 RETURNING *`,
      [
        patient_id ?? c.patient_id,
        doctor_id  ?? c.doctor_id,
        datetime   ?? c.datetime,
        reason     ?? c.reason,
        status     ?? c.status,
        id,
      ]
    );
    res.json({ success: true, message: "Appointment yangilandi", data: result.rows[0] });
  } catch (err) {
    console.error("updateAppointment xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// DELETE /admin/appointments/:id
export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Appointment topilmadi" });

    res.json({ success: true, message: "Appointment o'chirildi", data: result.rows[0] });
  } catch (err) {
    console.error("deleteAppointment xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// =============================================
// PRESCRIPTIONS CRUD
// =============================================

// GET /admin/prescriptions
export const getAllPrescriptions = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        pr.*,
        pat.name AS patient_name,
        doc.name AS doctor_name,
        a.datetime AS appointment_date,
        a.status   AS appointment_status
      FROM prescriptions pr
      JOIN appointments a   ON pr.app_id     = a.id
      JOIN patients     pat ON a.patient_id  = pat.id
      JOIN doctors      doc ON a.doctor_id   = doc.id
      ORDER BY pr.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllPrescriptions xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /admin/prescriptions/:id
export const getPrescriptionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT pr.*, pat.name AS patient_name, doc.name AS doctor_name,
              a.datetime AS appointment_date
       FROM prescriptions pr
       JOIN appointments a   ON pr.app_id    = a.id
       JOIN patients     pat ON a.patient_id = pat.id
       JOIN doctors      doc ON a.doctor_id  = doc.id
       WHERE pr.id = $1`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Retsept topilmadi" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getPrescriptionById xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// POST /admin/prescriptions
export const createPrescription = async (req: Request, res: Response) => {
  const { app_id, diagnos_desc, doktor } = req.body;
  if (!app_id || !diagnos_desc || !doktor)
    return res.status(400).json({
      success: false,
      message: "app_id, diagnos_desc va doktor majburiy",
    });

  try {
    const apptCheck = await pool.query(
      "SELECT id FROM appointments WHERE id = $1", [app_id]
    );
    if (apptCheck.rows.length === 0)
      return res.status(404).json({ success: false, message: "Appointment topilmadi" });

    const dupCheck = await pool.query(
      "SELECT id FROM prescriptions WHERE app_id = $1", [app_id]
    );
    if (dupCheck.rows.length > 0)
      return res.status(409).json({
        success: false,
        message: "Bu appointment uchun retsept allaqachon mavjud",
      });

    const result = await pool.query(
      `INSERT INTO prescriptions (app_id, diagnos_desc, doktor)
       VALUES ($1, $2, $3) RETURNING *`,
      [app_id, diagnos_desc, doktor]
    );

    await pool.query(
      "UPDATE appointments SET status = 'completed' WHERE id = $1", [app_id]
    );

    res.status(201).json({
      success: true,
      message: "Retsept yaratildi",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createPrescription xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// PUT /admin/prescriptions/:id
export const updatePrescription = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { diagnos_desc, doktor } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM prescriptions WHERE id = $1", [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: "Retsept topilmadi" });

    const c = existing.rows[0];
    const result = await pool.query(
      "UPDATE prescriptions SET diagnos_desc=$1, doktor=$2 WHERE id=$3 RETURNING *",
      [diagnos_desc ?? c.diagnos_desc, doktor ?? c.doktor, id]
    );
    res.json({ success: true, message: "Retsept yangilandi", data: result.rows[0] });
  } catch (err) {
    console.error("updatePrescription xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// DELETE /admin/prescriptions/:id
export const deletePrescription = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM prescriptions WHERE id = $1 RETURNING *", [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "Retsept topilmadi" });

    res.json({ success: true, message: "Retsept o'chirildi", data: result.rows[0] });
  } catch (err) {
    console.error("deletePrescription xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// =============================================
// PAYMENTS CRUD
// =============================================

// GET /admin/payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        pay.*,
        pat.name   AS patient_name,
        pat.phone  AS patient_phone,
        doc.name   AS doctor_name,
        a.datetime AS appointment_date,
        pr.diagnos_desc
      FROM payments pay
      JOIN appointments a   ON pay.app_id    = a.id
      JOIN patients     pat ON a.patient_id  = pat.id
      JOIN doctors      doc ON a.doctor_id   = doc.id
      LEFT JOIN prescriptions pr ON pr.app_id = a.id
      ORDER BY pay.id DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAllPayments xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// GET /admin/payments/:id
export const getPaymentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT pay.*, pat.name AS patient_name, doc.name AS doctor_name,
              a.datetime AS appointment_date, pr.diagnos_desc
       FROM payments pay
       JOIN appointments a   ON pay.app_id   = a.id
       JOIN patients     pat ON a.patient_id = pat.id
       JOIN doctors      doc ON a.doctor_id  = doc.id
       LEFT JOIN prescriptions pr ON pr.app_id = a.id
       WHERE pay.id = $1`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "To'lov topilmadi" });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getPaymentById xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// POST /admin/payments
export const createPayment = async (req: Request, res: Response) => {
  const { app_id, amount, payment_method } = req.body;
  if (!app_id || !amount || !payment_method)
    return res.status(400).json({
      success: false,
      message: "app_id, amount va payment_method majburiy",
    });

  const validMethods = ["cash", "card", "transfer"];
  if (!validMethods.includes(payment_method))
    return res.status(400).json({
      success: false,
      message: `payment_method: ${validMethods.join(", ")}`,
    });

  try {
    const apptCheck = await pool.query(
      "SELECT id FROM appointments WHERE id = $1", [app_id]
    );
    if (apptCheck.rows.length === 0)
      return res.status(404).json({ success: false, message: "Appointment topilmadi" });

    const dupCheck = await pool.query(
      "SELECT id FROM payments WHERE app_id = $1", [app_id]
    );
    if (dupCheck.rows.length > 0)
      return res.status(409).json({
        success: false,
        message: "Bu appointment uchun to'lov allaqachon mavjud",
      });

    const result = await pool.query(
      `INSERT INTO payments (app_id, amount, payment_method, status, paid_at, created_at)
       VALUES ($1, $2, $3, 'paid', NOW(), NOW()) RETURNING *`,
      [app_id, amount, payment_method]
    );
    res.status(201).json({
      success: true,
      message: "To'lov qo'shildi",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createPayment xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// PUT /admin/payments/:id
export const updatePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, payment_method, status } = req.body;

  const validStatuses = ["paid", "pending", "cancelled"];
  const validMethods  = ["cash", "card", "transfer"];

  if (status && !validStatuses.includes(status))
    return res.status(400).json({ success: false, message: `status: ${validStatuses.join(", ")}` });
  if (payment_method && !validMethods.includes(payment_method))
    return res.status(400).json({ success: false, message: `payment_method: ${validMethods.join(", ")}` });

  try {
    const existing = await pool.query("SELECT * FROM payments WHERE id = $1", [id]);
    if (existing.rows.length === 0)
      return res.status(404).json({ success: false, message: "To'lov topilmadi" });

    const c = existing.rows[0];
    const result = await pool.query(
      `UPDATE payments SET amount=$1, payment_method=$2, status=$3 WHERE id=$4 RETURNING *`,
      [amount ?? c.amount, payment_method ?? c.payment_method, status ?? c.status, id]
    );
    res.json({ success: true, message: "To'lov yangilandi", data: result.rows[0] });
  } catch (err) {
    console.error("updatePayment xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// DELETE /admin/payments/:id
export const deletePayment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM payments WHERE id = $1 RETURNING *", [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "To'lov topilmadi" });

    res.json({ success: true, message: "To'lov o'chirildi", data: result.rows[0] });
  } catch (err) {
    console.error("deletePayment xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

// =============================================
// REPORTS
// =============================================
export const viewReports = async (req: Request, res: Response) => {
  try {
    const dailyAppointments = await pool.query(`
      SELECT DATE(created_at) AS sana, COUNT(*) AS count
      FROM appointments
      GROUP BY DATE(created_at)
      ORDER BY sana DESC
      LIMIT 7
    `);

    const topDoctors = await pool.query(`
      SELECT d.name, COUNT(a.id) AS appointment_count
      FROM doctors d
      LEFT JOIN appointments a ON d.id = a.doctor_id
      GROUP BY d.id, d.name
      ORDER BY appointment_count DESC
      LIMIT 5
    `);

    const revenueByMethod = await pool.query(`
      SELECT payment_method, SUM(amount) AS total
      FROM payments
      WHERE status = 'paid'
      GROUP BY payment_method
    `);

    const monthlyRevenue = await pool.query(`
      SELECT TO_CHAR(paid_at, 'YYYY-MM') AS month, SUM(amount) AS total
      FROM payments
      WHERE status = 'paid'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      data: {
        dailyAppointments: dailyAppointments.rows,
        topDoctors:        topDoctors.rows,
        revenueByMethod:   revenueByMethod.rows,
        monthlyRevenue:    monthlyRevenue.rows,
      },
    });
  } catch (err) {
    console.error("viewReports xatosi:", err);
    res.status(500).json({ success: false, message: "Server xatosi" });
  }
};

