import type { FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import AuthGate from './components/AuthGate'
import Sidebar from './components/Sidebar'
import AppointmentsPage from './pages/AppointmentsPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import DoctorsPage from './pages/DoctorsPage'
import PatientsPage from './pages/PatientsPage'
import PaymentsPage from './pages/PaymentsPage'
import PrescriptionsPage from './pages/PrescriptionsPage'
import RegisterPage from './pages/RegisterPage'
import ReportsPage from './pages/ReportsPage'
import { apiRequest } from './services/api'
import type {
	ApiEnvelope,
	Appointment,
	AuthUser,
	DashboardResponse,
	DashboardStats,
	Doctor,
	Patient,
	Payment,
	PanelRole,
	Prescription,
	ReportsData,
	Tab,
} from './types/app'

type AuthResponse = {
	message: string
	user: AuthUser
	token?: string
}

const pageTabs: Tab[] = [
	'dashboard',
	'doctors',
	'patients',
	'appointments',
	'prescriptions',
	'payments',
	'reports',
	'auth',
	'register',
]

const adminTabs: Tab[] = [
	'dashboard',
	'doctors',
	'patients',
	'appointments',
	'prescriptions',
	'payments',
	'reports',
]

const cashierTabs: Tab[] = ['patients', 'appointments']
const defaultCashierLogin = 'cashier'
const defaultCashierPassword = 'cashier'

const readTabFromHash = (): Tab => {
	const hash = window.location.hash.replace(/^#\/?/, '')
	return pageTabs.includes(hash as Tab) ? (hash as Tab) : 'dashboard'
}

const readPanelRole = (): PanelRole => {
	const storedRole = localStorage.getItem('panelRole')
	return storedRole === 'cashier' ? 'cashier' : 'admin'
}

export default function App() {
	const [activeTab, setActiveTabState] = useState<Tab>(() => readTabFromHash())
	const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
	const [panelRole, setPanelRoleState] = useState<PanelRole>(() =>
		readPanelRole(),
	)
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
		status: 'pending' as Appointment['status'],
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
		payment_method: 'cash' as Payment['payment_method'],
		status: 'paid' as Payment['status'],
	})

	const [authRegister, setAuthRegister] = useState({ username: '', password: '' })
	const [authLogin, setAuthLogin] = useState({ username: '', password: '' })
	const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
		const rawUser = localStorage.getItem('user')
		if (!rawUser) return null

		try {
			return JSON.parse(rawUser) as AuthUser
		} catch {
			localStorage.removeItem('user')
			return null
		}
	})

	const isAuthenticated = currentUser !== null
	const visibleTabs = panelRole === 'admin' ? adminTabs : cashierTabs
	const defaultTab = panelRole === 'admin' ? 'dashboard' : 'patients'

	const setActiveTab = useCallback((tab: Tab) => {
		setActiveTabState(tab)
		window.location.hash = `/${tab}`
	}, [])

	const setPanelRole = useCallback(
		(role: PanelRole) => {
			setPanelRoleState(role)
			localStorage.setItem('panelRole', role)

			const nextVisibleTabs = role === 'admin' ? adminTabs : cashierTabs
			if (!nextVisibleTabs.includes(activeTab)) {
				const nextTab = role === 'admin' ? 'dashboard' : 'patients'
				setActiveTab(nextTab)
			}
		},
		[activeTab, setActiveTab],
	)

	useEffect(() => {
		const handleHashChange = () => setActiveTabState(readTabFromHash())
		window.addEventListener('hashchange', handleHashChange)
		return () => window.removeEventListener('hashchange', handleHashChange)
	}, [])

	useEffect(() => {
		if (!isAuthenticated || visibleTabs.includes(activeTab)) return
		setActiveTab(defaultTab)
	}, [activeTab, defaultTab, isAuthenticated, setActiveTab, visibleTabs])

	useEffect(() => {
		if (panelRole === 'cashier') {
			setAuthMode('login')
			setAuthLogin({
				username: defaultCashierLogin,
				password: defaultCashierPassword,
			})
			return
		}

		setAuthLogin(current => {
			if (
				current.username !== defaultCashierLogin ||
				current.password !== defaultCashierPassword
			) {
				return current
			}

			return { username: '', password: '' }
		})
	}, [panelRole])

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
			setError(err instanceof Error ? err.message : "Noma'lum xatolik")
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
		const response = await apiRequest<ApiEnvelope<ReportsData>>('/admin/reports')
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
		if (!isAuthenticated) return
		if (!visibleTabs.includes(activeTab)) return
		void Promise.resolve().then(() => runLoad(refreshActiveTab))
	}, [activeTab, isAuthenticated, refreshActiveTab, runLoad, visibleTabs])

	const showNotice = (message: string) => {
		setNotice(message)
		window.setTimeout(() => setNotice(''), 2500)
	}

	const tabLabel = useMemo<Record<Tab, string>>(
		() => ({
			dashboard: 'Dashboard',
			doctors: 'Doktorlar',
			patients: 'Bemorlar',
			appointments: 'Qabul',
			prescriptions: 'Retseptlar',
			payments: "To'lovlar",
			reports: 'Hisobotlar',
			auth: 'Login',
			register: 'Register',
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
				showNotice("Doktor qo'shildi")
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
				showNotice("Bemor qo'shildi")
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
				showNotice("Qabul qo'shildi")
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
				showNotice("Retsept qo'shildi")
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
				showNotice("To'lov yangilandi")
			} else {
				await apiRequest<ApiEnvelope<Payment>>('/admin/payments', {
					method: 'POST',
					body: JSON.stringify(payload),
				})
				showNotice("To'lov qo'shildi")
			}
			resetPaymentForm()
			await loadPayments()
		})
	}

	const removeRow = async (url: string, onDone: () => Promise<void>) => {
		await runLoad(async () => {
			await apiRequest<ApiEnvelope<unknown>>(url, { method: 'DELETE' })
			showNotice("Muvaffaqiyatli o'chirildi")
			await onDone()
		})
	}

	const saveAuth = (response: AuthResponse) => {
		setCurrentUser(response.user)
		localStorage.setItem('user', JSON.stringify(response.user))
		localStorage.setItem('panelRole', panelRole)
		if (response.token) localStorage.setItem('token', response.token)
	}

	const submitRegister = async (e: FormEvent) => {
		e.preventDefault()
		if (panelRole === 'cashier') return

		await runLoad(async () => {
			const response = await apiRequest<AuthResponse>('/auth/register', {
				method: 'POST',
				body: JSON.stringify(authRegister),
			})

			setAuthRegister({ username: '', password: '' })
			saveAuth(response)
			showNotice(response.message)
			setActiveTab(defaultTab)
		})
	}

	const submitLogin = async (e: FormEvent) => {
		e.preventDefault()
		await runLoad(async () => {
			const response =
				panelRole === 'cashier'
					? await apiRequest<AuthResponse>('/auth/cashier-login', {
							method: 'POST',
							body: JSON.stringify({
								login: authLogin.username,
								psw: authLogin.password,
							}),
						})
					: await apiRequest<AuthResponse>('/auth/login', {
							method: 'POST',
							body: JSON.stringify(authLogin),
						})

			saveAuth(response)
			if (panelRole === 'admin') setAuthLogin({ username: '', password: '' })
			showNotice(response.message)
			setActiveTab(defaultTab)
		})
	}

	const logout = () => {
		setCurrentUser(null)
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		setAuthMode('login')
		setActiveTab(defaultTab)
	}

	const renderActivePage = () => {
		if (activeTab === 'dashboard') return <DashboardPage stats={stats} />

		if (activeTab === 'doctors') {
			return (
				<DoctorsPage
					doctorForm={doctorForm}
					setDoctorForm={setDoctorForm}
					resetDoctorForm={resetDoctorForm}
					submitDoctor={submitDoctor}
					doctors={doctors}
					removeRow={removeRow}
					loadDoctors={loadDoctors}
				/>
			)
		}

		if (activeTab === 'patients') {
			return (
				<PatientsPage
					patientForm={patientForm}
					setPatientForm={setPatientForm}
					resetPatientForm={resetPatientForm}
					submitPatient={submitPatient}
					patients={patients}
					removeRow={removeRow}
					loadPatients={loadPatients}
				/>
			)
		}

		if (activeTab === 'appointments') {
			return (
				<AppointmentsPage
					appointmentForm={appointmentForm}
					setAppointmentForm={setAppointmentForm}
					resetAppointmentForm={resetAppointmentForm}
					submitAppointment={submitAppointment}
					appointments={appointments}
					removeRow={removeRow}
					loadAppointments={loadAppointments}
				/>
			)
		}

		if (activeTab === 'prescriptions') {
			return (
				<PrescriptionsPage
					prescriptionForm={prescriptionForm}
					setPrescriptionForm={setPrescriptionForm}
					resetPrescriptionForm={resetPrescriptionForm}
					submitPrescription={submitPrescription}
					prescriptions={prescriptions}
					removeRow={removeRow}
					loadPrescriptions={loadPrescriptions}
				/>
			)
		}

		if (activeTab === 'payments') {
			return (
				<PaymentsPage
					paymentForm={paymentForm}
					setPaymentForm={setPaymentForm}
					resetPaymentForm={resetPaymentForm}
					submitPayment={submitPayment}
					payments={payments}
					removeRow={removeRow}
					loadPayments={loadPayments}
				/>
			)
		}

		if (activeTab === 'reports') return <ReportsPage reports={reports} />

		if (activeTab === 'auth') {
			return (
				<AuthPage
					submitLogin={submitLogin}
					authLogin={authLogin}
					setAuthLogin={setAuthLogin}
					currentUser={currentUser}
					setActiveTabToRegister={() => setActiveTab('register')}
				/>
			)
		}

		return (
			<RegisterPage
				submitRegister={submitRegister}
				authRegister={authRegister}
				setAuthRegister={setAuthRegister}
			/>
		)
	}

	if (!isAuthenticated) {
		return (
			<AuthGate
				authMode={authMode}
				setAuthMode={setAuthMode}
				panelRole={panelRole}
				setPanelRole={setPanelRole}
				authLogin={authLogin}
				authRegister={authRegister}
				setAuthLogin={setAuthLogin}
				setAuthRegister={setAuthRegister}
				submitLogin={submitLogin}
				submitRegister={submitRegister}
				notice={notice}
				error={error}
				loading={loading}
			/>
		)
	}

	return (
		<div className='app-shell'>
			<Sidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				tabLabel={tabLabel}
				visibleTabs={visibleTabs}
				panelRole={panelRole}
			/>

			<main className='content'>
				<header className='content-head'>
					<h2>{tabLabel[activeTab]}</h2>
					<div className='header-actions'>
						<button type='button' onClick={() => void runLoad(refreshActiveTab)}>
							Yangilash
						</button>
						<button type='button' onClick={logout}>
							Chiqish
						</button>
					</div>
				</header>

				{notice && <div className='notice'>{notice}</div>}
				{error && <div className='error'>{error}</div>}
				{loading && <div className='loading'>Yuklanmoqda...</div>}

				{renderActivePage()}
			</main>
		</div>
	)
}
