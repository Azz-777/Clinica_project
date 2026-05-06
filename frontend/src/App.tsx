import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

type Tab =
	| 'dashboard'
	| 'doctors'
	| 'patients'
	| 'appointments'
	| 'prescriptions'
	| 'payments'
	| 'reports'
	| 'auth'

type ApiEnvelope<T> = {
	success: boolean
	message?: string
	data: T
}

type Doctor = { id: number; name: string }

type Patient = {
	id: number
	name: string
	phone: string | null
	birth_date: string | null
	gender: string | null
	address: string | null
}

type Appointment = {
	id: number
	patient_id: number
	doctor_id: number
	datetime: string
	reason: string | null
	status: 'pending' | 'completed' | 'cancelled'
	patient_name?: string
	doctor_name?: string
}

type Prescription = {
	id: number
	app_id: number
	diagnos_desc: string
	doktor: string
	patient_name?: string
	doctor_name?: string
	appointment_date?: string
}

type Payment = {
	id: number
	app_id: number
	amount: number
	payment_method: 'cash' | 'card' | 'transfer'
	status: 'paid' | 'pending' | 'cancelled'
	paid_at?: string
	patient_name?: string
	doctor_name?: string
}

type DashboardStats = {
	doctors: number
	patients: number
	appointments: number
	prescriptions: number
	payments: number
	totalRevenue: number
	pendingAppointments: number
	completedAppointments: number
}

type DashboardResponse = {
	success: boolean
	message?: string
	stats: DashboardStats
}

type ReportsData = {
	dailyAppointments: Array<{ sana: string; count: string }>
	topDoctors: Array<{ name: string; appointment_count: string }>
	revenueByMethod: Array<{ payment_method: string; total: string }>
	monthlyRevenue: Array<{ month: string; total: string }>
}

type AuthUser = {
	id: number
	username: string
}

const API_BASE = '/api'

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${API_BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...init,
	})

	const body = await response.json().catch(() => ({}))

	if (!response.ok) {
		const message =
			(body as { message?: string; error?: string }).message ||
			(body as { message?: string; error?: string }).error ||
			'So‘rov bajarilmadi'
		throw new Error(message)
	}

	return body as T
}

const toInputDateTime = (value: string) => {
	const dt = new Date(value)
	if (Number.isNaN(dt.getTime())) return ''
	return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16)
}

const formatDate = (value?: string | null) => {
	if (!value) return '-'
	const dt = new Date(value)
	if (Number.isNaN(dt.getTime())) return value
	return dt.toLocaleString()
}

export default function App() {
	const [activeTab, setActiveTab] = useState<Tab>('dashboard')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [notice, setNotice] = useState('')

	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [reports, setReports] = useState<ReportsData | null>(null)

	const [doctors, setDoctors] = useState<Doctor[]>([])
	const [patients, setPatients] = useState<Patient[]>([])
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
	const [payments, setPayments] = useState<Payment[]>([])

	const [doctorForm, setDoctorForm] = useState({ id: 0, name: '', psw: '' })
	const [patientForm, setPatientForm] = useState({
		id: 0,
		name: '',
		phone: '',
		birth_date: '',
		gender: '',
		address: '',
	})
	const [appointmentForm, setAppointmentForm] = useState({
		id: 0,
		patient_id: '',
		doctor_id: '',
		datetime: '',
		reason: '',
		status: 'pending',
	})
	const [prescriptionForm, setPrescriptionForm] = useState({
		id: 0,
		app_id: '',
		diagnos_desc: '',
		doktor: '',
	})
	const [paymentForm, setPaymentForm] = useState({
		id: 0,
		app_id: '',
		amount: '',
		payment_method: 'cash',
		status: 'paid',
	})

	const [authRegister, setAuthRegister] = useState({
		username: '',
		password: '',
	})
	const [authLogin, setAuthLogin] = useState({ username: '', password: '' })
	const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

	const resetDoctorForm = () => setDoctorForm({ id: 0, name: '', psw: '' })
	const resetPatientForm = () =>
		setPatientForm({
			id: 0,
			name: '',
			phone: '',
			birth_date: '',
			gender: '',
			address: '',
		})
	const resetAppointmentForm = () =>
		setAppointmentForm({
			id: 0,
			patient_id: '',
			doctor_id: '',
			datetime: '',
			reason: '',
			status: 'pending',
		})
	const resetPrescriptionForm = () =>
		setPrescriptionForm({ id: 0, app_id: '', diagnos_desc: '', doktor: '' })
	const resetPaymentForm = () =>
		setPaymentForm({
			id: 0,
			app_id: '',
			amount: '',
			payment_method: 'cash',
			status: 'paid',
		})

	const runLoad = useCallback(async (loader: () => Promise<void>) => {
		setLoading(true)
		setError('')
		try {
			await loader()
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Noma’lum xatolik')
		} finally {
			setLoading(false)
		}
	}, [])

	const loadDashboard = useCallback(async () => {
		const response = await apiRequest<DashboardResponse>('/admin/dashboard')
		setStats(response.stats)
	}, [])

	const loadDoctors = useCallback(async () => {
		const response = await apiRequest<ApiEnvelope<Doctor[]>>('/admin/doctors')
		setDoctors(response.data)
	}, [])

	const loadPatients = useCallback(async () => {
		const response = await apiRequest<ApiEnvelope<Patient[]>>('/admin/patients')
		setPatients(response.data)
	}, [])

	const loadAppointments = useCallback(async () => {
		const response = await apiRequest<ApiEnvelope<Appointment[]>>(
			'/admin/appointments',
		)
		setAppointments(response.data)
	}, [])

	const loadPrescriptions = useCallback(async () => {
		const response = await apiRequest<ApiEnvelope<Prescription[]>>(
			'/admin/prescriptions',
		)
		setPrescriptions(response.data)
	}, [])

	const loadPayments = useCallback(async () => {
		const response = await apiRequest<ApiEnvelope<Payment[]>>('/admin/payments')
		setPayments(response.data)
	}, [])

	const loadReports = useCallback(async () => {
		const response =
			await apiRequest<ApiEnvelope<ReportsData>>('/admin/reports')
		setReports(response.data)
	}, [])

	const refreshActiveTab = useCallback(async () => {
		if (activeTab === 'dashboard') return loadDashboard()
		if (activeTab === 'doctors') return loadDoctors()
		if (activeTab === 'patients') return loadPatients()
		if (activeTab === 'appointments') return loadAppointments()
		if (activeTab === 'prescriptions') return loadPrescriptions()
		if (activeTab === 'payments') return loadPayments()
		if (activeTab === 'reports') return loadReports()
	}, [
		activeTab,
		loadAppointments,
		loadDashboard,
		loadDoctors,
		loadPatients,
		loadPayments,
		loadPrescriptions,
		loadReports,
	])

	useEffect(() => {
		void Promise.resolve().then(() => runLoad(refreshActiveTab))
	}, [activeTab, refreshActiveTab, runLoad])

	const showNotice = (message: string) => {
		setNotice(message)
		setTimeout(() => setNotice(''), 2500)
	}

	const tabLabel = useMemo(
		() => ({
			dashboard: 'Dashboard',
			doctors: 'Doktorlar',
			patients: 'Bemorlar',
			appointments: 'Qabul',
			prescriptions: 'Retseptlar',
			payments: 'To‘lovlar',
			reports: 'Hisobotlar',
			auth: 'Auth',
		}),
		[],
	)

	const submitDoctor = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			if (doctorForm.id) {
				await apiRequest<ApiEnvelope<Doctor>>(
					`/admin/doctors/${doctorForm.id}`,
					{
						method: 'PUT',
						body: JSON.stringify({
							name: doctorForm.name,
							psw: doctorForm.psw || undefined,
						}),
					},
				)
				showNotice('Doktor yangilandi')
			} else {
				await apiRequest<ApiEnvelope<Doctor>>('/admin/doctors', {
					method: 'POST',
					body: JSON.stringify({ name: doctorForm.name, psw: doctorForm.psw }),
				})
				showNotice('Doktor qo‘shildi')
			}
			resetDoctorForm()
			await loadDoctors()
		})
	}

	const submitPatient = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			const payload = {
				name: patientForm.name,
				phone: patientForm.phone || null,
				birth_date: patientForm.birth_date || null,
				gender: patientForm.gender || null,
				address: patientForm.address || null,
			}
			if (patientForm.id) {
				await apiRequest<ApiEnvelope<Patient>>(
					`/admin/patients/${patientForm.id}`,
					{
						method: 'PUT',
						body: JSON.stringify(payload),
					},
				)
				showNotice('Bemor yangilandi')
			} else {
				await apiRequest<ApiEnvelope<Patient>>('/admin/patients', {
					method: 'POST',
					body: JSON.stringify(payload),
				})
				showNotice('Bemor qo‘shildi')
			}
			resetPatientForm()
			await loadPatients()
		})
	}

	const submitAppointment = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			const payload = {
				patient_id: Number(appointmentForm.patient_id),
				doctor_id: Number(appointmentForm.doctor_id),
				datetime: appointmentForm.datetime,
				reason: appointmentForm.reason || null,
				status: appointmentForm.status,
			}
			if (appointmentForm.id) {
				await apiRequest<ApiEnvelope<Appointment>>(
					`/admin/appointments/${appointmentForm.id}`,
					{
						method: 'PUT',
						body: JSON.stringify(payload),
					},
				)
				showNotice('Qabul yangilandi')
			} else {
				await apiRequest<ApiEnvelope<Appointment>>('/admin/appointments', {
					method: 'POST',
					body: JSON.stringify(payload),
				})
				showNotice('Qabul qo‘shildi')
			}
			resetAppointmentForm()
			await loadAppointments()
		})
	}

	const submitPrescription = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			const payload = {
				app_id: Number(prescriptionForm.app_id),
				diagnos_desc: prescriptionForm.diagnos_desc,
				doktor: prescriptionForm.doktor,
			}
			if (prescriptionForm.id) {
				await apiRequest<ApiEnvelope<Prescription>>(
					`/admin/prescriptions/${prescriptionForm.id}`,
					{
						method: 'PUT',
						body: JSON.stringify(payload),
					},
				)
				showNotice('Retsept yangilandi')
			} else {
				await apiRequest<ApiEnvelope<Prescription>>('/admin/prescriptions', {
					method: 'POST',
					body: JSON.stringify(payload),
				})
				showNotice('Retsept qo‘shildi')
			}
			resetPrescriptionForm()
			await loadPrescriptions()
			await loadAppointments()
		})
	}

	const submitPayment = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			const payload = {
				app_id: Number(paymentForm.app_id),
				amount: Number(paymentForm.amount),
				payment_method: paymentForm.payment_method,
				status: paymentForm.status,
			}
			if (paymentForm.id) {
				await apiRequest<ApiEnvelope<Payment>>(
					`/admin/payments/${paymentForm.id}`,
					{
						method: 'PUT',
						body: JSON.stringify(payload),
					},
				)
				showNotice('To‘lov yangilandi')
			} else {
				await apiRequest<ApiEnvelope<Payment>>('/admin/payments', {
					method: 'POST',
					body: JSON.stringify(payload),
				})
				showNotice('To‘lov qo‘shildi')
			}
			resetPaymentForm()
			await loadPayments()
		})
	}

	const removeRow = async (url: string, onDone: () => Promise<void>) => {
		await runLoad(async () => {
			await apiRequest<ApiEnvelope<unknown>>(url, { method: 'DELETE' })
			showNotice('Muvaffaqiyatli o‘chirildi')
			await onDone()
		})
	}

	const submitRegister = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			const response = await apiRequest<{ message: string; user: AuthUser }>(
				'/auth/register',
				{
					method: 'POST',
					body: JSON.stringify(authRegister),
				},
			)
			setCurrentUser(response.user)
			setAuthRegister({ username: '', password: '' })
			showNotice(response.message)
		})
	}

	const submitLogin = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			const response = await apiRequest<{ message: string; user: AuthUser }>(
				'/auth/login',
				{
					method: 'POST',
					body: JSON.stringify(authLogin),
				},
			)
			setCurrentUser(response.user)
			setAuthLogin({ username: '', password: '' })
			showNotice(response.message)
		})
	}

	return (
		<div className='app-shell'>
			<aside className='left-panel'>
				<h1>Clinica Admin</h1>
				<p>Backend endpointlarga to‘liq ulanadigan frontend.</p>
				<nav>
					{(Object.keys(tabLabel) as Tab[]).map(tab => (
						<button
							key={tab}
							type='button'
							className={activeTab === tab ? 'active' : ''}
							onClick={() => setActiveTab(tab)}
						>
							{tabLabel[tab]}
						</button>
					))}
				</nav>
			</aside>

			<main className='content'>
				<header className='content-head'>
					<h2>{tabLabel[activeTab]}</h2>
					<button type='button' onClick={() => void runLoad(refreshActiveTab)}>
						Yangilash
					</button>
				</header>

				{notice && <div className='notice'>{notice}</div>}
				{error && <div className='error'>{error}</div>}
				{loading && <div className='loading'>Yuklanmoqda...</div>}

				{activeTab === 'dashboard' && stats && (
					<section className='cards-grid'>
						<article>
							<h3>Doktorlar</h3>
							<p>{stats.doctors}</p>
						</article>
						<article>
							<h3>Bemorlar</h3>
							<p>{stats.patients}</p>
						</article>
						<article>
							<h3>Qabullar</h3>
							<p>{stats.appointments}</p>
						</article>
						<article>
							<h3>Retseptlar</h3>
							<p>{stats.prescriptions}</p>
						</article>
						<article>
							<h3>To‘lovlar</h3>
							<p>{stats.payments}</p>
						</article>
						<article>
							<h3>Daromad</h3>
							<p>${stats.totalRevenue}</p>
						</article>
						<article>
							<h3>Pending</h3>
							<p>{stats.pendingAppointments}</p>
						</article>
						<article>
							<h3>Completed</h3>
							<p>{stats.completedAppointments}</p>
						</article>
					</section>
				)}

				{activeTab === 'doctors' && (
					<section>
						<form className='editor-form' onSubmit={e => void submitDoctor(e)}>
							<input
								required
								placeholder='Doktor ismi'
								value={doctorForm.name}
								onChange={e =>
									setDoctorForm(p => ({ ...p, name: e.target.value }))
								}
							/>
							<input
								required={!doctorForm.id}
								placeholder={doctorForm.id ? 'Parol (ixtiyoriy)' : 'Parol'}
								value={doctorForm.psw}
								onChange={e =>
									setDoctorForm(p => ({ ...p, psw: e.target.value }))
								}
							/>
							<button type='submit'>
								{doctorForm.id ? 'Saqlash' : 'Qo‘shish'}
							</button>
							{doctorForm.id > 0 && (
								<button type='button' onClick={resetDoctorForm}>
									Bekor qilish
								</button>
							)}
						</form>
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Ism</th>
									<th>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{doctors.map(d => (
									<tr key={d.id}>
										<td>{d.id}</td>
										<td>{d.name}</td>
										<td className='actions'>
											<button
												type='button'
												onClick={() =>
													setDoctorForm({ id: d.id, name: d.name, psw: '' })
												}
											>
												Edit
											</button>
											<button
												type='button'
												onClick={() =>
													void removeRow(`/admin/doctors/${d.id}`, loadDoctors)
												}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				)}

				{activeTab === 'patients' && (
					<section>
						<form className='editor-form' onSubmit={e => void submitPatient(e)}>
							<input
								required
								placeholder='Ism'
								value={patientForm.name}
								onChange={e =>
									setPatientForm(p => ({ ...p, name: e.target.value }))
								}
							/>
							<input
								placeholder='Telefon'
								value={patientForm.phone}
								onChange={e =>
									setPatientForm(p => ({ ...p, phone: e.target.value }))
								}
							/>
							<input
								type='date'
								value={patientForm.birth_date}
								onChange={e =>
									setPatientForm(p => ({ ...p, birth_date: e.target.value }))
								}
							/>
							<input
								placeholder='Jins'
								value={patientForm.gender}
								onChange={e =>
									setPatientForm(p => ({ ...p, gender: e.target.value }))
								}
							/>
							<input
								placeholder='Manzil'
								value={patientForm.address}
								onChange={e =>
									setPatientForm(p => ({ ...p, address: e.target.value }))
								}
							/>
							<button type='submit'>
								{patientForm.id ? 'Saqlash' : 'Qo‘shish'}
							</button>
							{patientForm.id > 0 && (
								<button type='button' onClick={resetPatientForm}>
									Bekor qilish
								</button>
							)}
						</form>
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Ism</th>
									<th>Telefon</th>
									<th>Tug‘ilgan sana</th>
									<th>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{patients.map(p => (
									<tr key={p.id}>
										<td>{p.id}</td>
										<td>{p.name}</td>
										<td>{p.phone || '-'}</td>
										<td>{formatDate(p.birth_date)}</td>
										<td className='actions'>
											<button
												type='button'
												onClick={() =>
													setPatientForm({
														id: p.id,
														name: p.name,
														phone: p.phone || '',
														birth_date: p.birth_date
															? p.birth_date.slice(0, 10)
															: '',
														gender: p.gender || '',
														address: p.address || '',
													})
												}
											>
												Edit
											</button>
											<button
												type='button'
												onClick={() =>
													void removeRow(
														`/admin/patients/${p.id}`,
														loadPatients,
													)
												}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				)}

				{activeTab === 'appointments' && (
					<section>
						<form
							className='editor-form'
							onSubmit={e => void submitAppointment(e)}
						>
							<input
								required
								type='number'
								placeholder='Patient ID'
								value={appointmentForm.patient_id}
								onChange={e =>
									setAppointmentForm(p => ({
										...p,
										patient_id: e.target.value,
									}))
								}
							/>
							<input
								required
								type='number'
								placeholder='Doctor ID'
								value={appointmentForm.doctor_id}
								onChange={e =>
									setAppointmentForm(p => ({ ...p, doctor_id: e.target.value }))
								}
							/>
							<input
								required
								type='datetime-local'
								value={appointmentForm.datetime}
								onChange={e =>
									setAppointmentForm(p => ({ ...p, datetime: e.target.value }))
								}
							/>
							<input
								placeholder='Sabab'
								value={appointmentForm.reason}
								onChange={e =>
									setAppointmentForm(p => ({ ...p, reason: e.target.value }))
								}
							/>
							<select
								value={appointmentForm.status}
								onChange={e =>
									setAppointmentForm(p => ({
										...p,
										status: e.target.value as Appointment['status'],
									}))
								}
							>
								<option value='pending'>pending</option>
								<option value='completed'>completed</option>
								<option value='cancelled'>cancelled</option>
							</select>
							<button type='submit'>
								{appointmentForm.id ? 'Saqlash' : 'Qo‘shish'}
							</button>
							{appointmentForm.id > 0 && (
								<button type='button' onClick={resetAppointmentForm}>
									Bekor qilish
								</button>
							)}
						</form>
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Bemor</th>
									<th>Doktor</th>
									<th>Vaqt</th>
									<th>Status</th>
									<th>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{appointments.map(a => (
									<tr key={a.id}>
										<td>{a.id}</td>
										<td>{a.patient_name || a.patient_id}</td>
										<td>{a.doctor_name || a.doctor_id}</td>
										<td>{formatDate(a.datetime)}</td>
										<td>{a.status}</td>
										<td className='actions'>
											<button
												type='button'
												onClick={() =>
													setAppointmentForm({
														id: a.id,
														patient_id: String(a.patient_id),
														doctor_id: String(a.doctor_id),
														datetime: toInputDateTime(a.datetime),
														reason: a.reason || '',
														status: a.status,
													})
												}
											>
												Edit
											</button>
											<button
												type='button'
												onClick={() =>
													void removeRow(
														`/admin/appointments/${a.id}`,
														loadAppointments,
													)
												}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				)}

				{activeTab === 'prescriptions' && (
					<section>
						<form
							className='editor-form'
							onSubmit={e => void submitPrescription(e)}
						>
							<input
								required
								type='number'
								placeholder='Appointment ID'
								value={prescriptionForm.app_id}
								onChange={e =>
									setPrescriptionForm(p => ({ ...p, app_id: e.target.value }))
								}
							/>
							<input
								required
								placeholder='Diagnoz'
								value={prescriptionForm.diagnos_desc}
								onChange={e =>
									setPrescriptionForm(p => ({
										...p,
										diagnos_desc: e.target.value,
									}))
								}
							/>
							<input
								required
								placeholder='Doktor izohi'
								value={prescriptionForm.doktor}
								onChange={e =>
									setPrescriptionForm(p => ({ ...p, doktor: e.target.value }))
								}
							/>
							<button type='submit'>
								{prescriptionForm.id ? 'Saqlash' : 'Qo‘shish'}
							</button>
							{prescriptionForm.id > 0 && (
								<button type='button' onClick={resetPrescriptionForm}>
									Bekor qilish
								</button>
							)}
						</form>
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Appointment</th>
									<th>Bemor</th>
									<th>Diagnoz</th>
									<th>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{prescriptions.map(p => (
									<tr key={p.id}>
										<td>{p.id}</td>
										<td>{p.app_id}</td>
										<td>{p.patient_name || '-'}</td>
										<td>{p.diagnos_desc}</td>
										<td className='actions'>
											<button
												type='button'
												onClick={() =>
													setPrescriptionForm({
														id: p.id,
														app_id: String(p.app_id),
														diagnos_desc: p.diagnos_desc,
														doktor: p.doktor,
													})
												}
											>
												Edit
											</button>
											<button
												type='button'
												onClick={() =>
													void removeRow(
														`/admin/prescriptions/${p.id}`,
														loadPrescriptions,
													)
												}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				)}

				{activeTab === 'payments' && (
					<section>
						<form className='editor-form' onSubmit={e => void submitPayment(e)}>
							<input
								required
								type='number'
								placeholder='Appointment ID'
								value={paymentForm.app_id}
								onChange={e =>
									setPaymentForm(p => ({ ...p, app_id: e.target.value }))
								}
							/>
							<input
								required
								type='number'
								placeholder='Miqdor'
								value={paymentForm.amount}
								onChange={e =>
									setPaymentForm(p => ({ ...p, amount: e.target.value }))
								}
							/>
							<select
								value={paymentForm.payment_method}
								onChange={e =>
									setPaymentForm(p => ({
										...p,
										payment_method: e.target.value as Payment['payment_method'],
									}))
								}
							>
								<option value='cash'>cash</option>
								<option value='card'>card</option>
								<option value='transfer'>transfer</option>
							</select>
							<select
								value={paymentForm.status}
								onChange={e =>
									setPaymentForm(p => ({
										...p,
										status: e.target.value as Payment['status'],
									}))
								}
							>
								<option value='paid'>paid</option>
								<option value='pending'>pending</option>
								<option value='cancelled'>cancelled</option>
							</select>
							<button type='submit'>
								{paymentForm.id ? 'Saqlash' : 'Qo‘shish'}
							</button>
							{paymentForm.id > 0 && (
								<button type='button' onClick={resetPaymentForm}>
									Bekor qilish
								</button>
							)}
						</form>
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>App ID</th>
									<th>Miqdor</th>
									<th>Usul</th>
									<th>Status</th>
									<th>Amallar</th>
								</tr>
							</thead>
							<tbody>
								{payments.map(p => (
									<tr key={p.id}>
										<td>{p.id}</td>
										<td>{p.app_id}</td>
										<td>{p.amount}</td>
										<td>{p.payment_method}</td>
										<td>{p.status}</td>
										<td className='actions'>
											<button
												type='button'
												onClick={() =>
													setPaymentForm({
														id: p.id,
														app_id: String(p.app_id),
														amount: String(p.amount),
														payment_method: p.payment_method,
														status: p.status,
													})
												}
											>
												Edit
											</button>
											<button
												type='button'
												onClick={() =>
													void removeRow(
														`/admin/payments/${p.id}`,
														loadPayments,
													)
												}
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				)}

				{activeTab === 'reports' && reports && (
					<section className='reports-grid'>
						<article>
							<h3>Kunlik qabul (oxirgi 7 kun)</h3>
							<ul>
								{reports.dailyAppointments.map(row => (
									<li key={row.sana}>
										<span>{row.sana}</span>
										<b>{row.count}</b>
									</li>
								))}
							</ul>
						</article>
						<article>
							<h3>Top doktorlar</h3>
							<ul>
								{reports.topDoctors.map(row => (
									<li key={row.name}>
										<span>{row.name}</span>
										<b>{row.appointment_count}</b>
									</li>
								))}
							</ul>
						</article>
						<article>
							<h3>To‘lov usuli bo‘yicha</h3>
							<ul>
								{reports.revenueByMethod.map(row => (
									<li key={row.payment_method}>
										<span>{row.payment_method}</span>
										<b>{row.total}</b>
									</li>
								))}
							</ul>
						</article>
						<article>
							<h3>Oylik daromad</h3>
							<ul>
								{reports.monthlyRevenue.map(row => (
									<li key={row.month}>
										<span>{row.month}</span>
										<b>{row.total}</b>
									</li>
								))}
							</ul>
						</article>
					</section>
				)}

				{activeTab === 'auth' && (
					<section className='auth-grid'>
						<article>
							<h3>Ro‘yxatdan o‘tish</h3>
							<form
								className='editor-form'
								onSubmit={e => void submitRegister(e)}
							>
								<input
									required
									placeholder='Username'
									value={authRegister.username}
									onChange={e =>
										setAuthRegister(p => ({ ...p, username: e.target.value }))
									}
								/>
								<input
									required
									type='password'
									placeholder='Parol'
									value={authRegister.password}
									onChange={e =>
										setAuthRegister(p => ({ ...p, password: e.target.value }))
									}
								/>
								<button type='submit'>Register</button>
							</form>
						</article>
						<article>
							<h3>Login</h3>
							<form className='editor-form' onSubmit={e => void submitLogin(e)}>
								<input
									required
									placeholder='Username'
									value={authLogin.username}
									onChange={e =>
										setAuthLogin(p => ({ ...p, username: e.target.value }))
									}
								/>
								<input
									required
									type='password'
									placeholder='Parol'
									value={authLogin.password}
									onChange={e =>
										setAuthLogin(p => ({ ...p, password: e.target.value }))
									}
								/>
								<button type='submit'>Login</button>
							</form>
						</article>
						<article>
							<h3>Current user</h3>
							<p>
								{currentUser
									? `${currentUser.username} (#${currentUser.id})`
									: 'Login qilinmagan'}
							</p>
						</article>
					</section>
				)}
			</main>
		</div>
	)
}
