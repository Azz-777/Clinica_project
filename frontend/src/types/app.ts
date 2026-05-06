export type Tab =
	| 'dashboard'
	| 'doctors'
	| 'patients'
	| 'appointments'
	| 'prescriptions'
	| 'payments'
	| 'reports'
	| 'auth'
	| 'register'

export type PanelRole = 'admin' | 'cashier'

export type ApiEnvelope<T> = {
	success: boolean
	message?: string
	data: T
}

export type Doctor = { id: number; name: string }

export type Patient = {
	id: number
	name: string
	phone: string | null
	birth_date: string | null
	gender: string | null
	address: string | null
}

export type Appointment = {
	id: number
	patient_id: number
	doctor_id: number
	datetime: string
	reason: string | null
	status: 'pending' | 'completed' | 'cancelled'
	patient_name?: string
	doctor_name?: string
}

export type Prescription = {
	id: number
	app_id: number
	diagnos_desc: string
	doktor: string
	patient_name?: string
	doctor_name?: string
	appointment_date?: string
}

export type Payment = {
	id: number
	app_id: number
	amount: number
	payment_method: 'cash' | 'card' | 'transfer'
	status: 'paid' | 'pending' | 'cancelled'
	paid_at?: string
	patient_name?: string
	doctor_name?: string
}

export type DashboardStats = {
	doctors: number
	patients: number
	appointments: number
	prescriptions: number
	payments: number
	totalRevenue: number
	pendingAppointments: number
	completedAppointments: number
}

export type DashboardResponse = {
	success: boolean
	message?: string
	stats: DashboardStats
}

export type ReportsData = {
	dailyAppointments: Array<{ sana: string; count: string }>
	topDoctors: Array<{ name: string; appointment_count: string }>
	revenueByMethod: Array<{ payment_method: string; total: string }>
	monthlyRevenue: Array<{ month: string; total: string }>
}

export type AuthUser = {
	id: number
	username: string
	role?: PanelRole
}
