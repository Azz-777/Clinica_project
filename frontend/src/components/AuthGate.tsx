import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { PanelRole } from '../types/app'

type Props = {
	authMode: 'login' | 'register'
	setAuthMode: (mode: 'login' | 'register') => void
	panelRole: PanelRole
	setPanelRole: (role: PanelRole) => void
	authLogin: { username: string; password: string }
	authRegister: { username: string; password: string }
	setAuthLogin: Dispatch<SetStateAction<{ username: string; password: string }>>
	setAuthRegister: Dispatch<
		SetStateAction<{ username: string; password: string }>
	>
	submitLogin: (e: FormEvent) => Promise<void>
	submitRegister: (e: FormEvent) => Promise<void>
	notice: string
	error: string
	loading: boolean
}

export default function AuthGate({
	authMode,
	setAuthMode,
	panelRole,
	setPanelRole,
	authLogin,
	authRegister,
	setAuthLogin,
	setAuthRegister,
	submitLogin,
	submitRegister,
	notice,
	error,
	loading,
}: Props) {
	return (
		<div className='auth-only-shell'>
			<section className='auth-only-card'>
				<h1>Clinica Care</h1>
				<p>Tizimga kirish uchun login va parolingizni kiriting.</p>

				<div className='auth-mode-switch'>
					<button
						type='button'
						className={panelRole === 'admin' ? 'active' : ''}
						onClick={() => setPanelRole('admin')}
					>
						Admin
					</button>
					<button
						type='button'
						className={panelRole === 'cashier' ? 'active' : ''}
						onClick={() => setPanelRole('cashier')}
					>
						Cashier
					</button>
				</div>

				{panelRole === 'admin' && (
					<div className='auth-mode-switch'>
						<button
							type='button'
							className={authMode === 'login' ? 'active' : ''}
							onClick={() => setAuthMode('login')}
						>
							Login
						</button>
						<button
							type='button'
							className={authMode === 'register' ? 'active' : ''}
							onClick={() => setAuthMode('register')}
						>
							Register
						</button>
					</div>
				)}

				{notice && <div className='notice'>{notice}</div>}
				{error && <div className='error'>{error}</div>}
				{loading && <div className='loading'>Yuklanmoqda...</div>}

				{authMode === 'login' ? (
					<form className='editor-form' onSubmit={e => void submitLogin(e)}>
						<input
							required
							placeholder={panelRole === 'cashier' ? 'Login' : 'Username'}
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
						<button type='submit'>
							{panelRole === 'cashier' ? 'Cashier panelga kirish' : 'Davom etish'}
						</button>
					</form>
				) : (
					<form className='editor-form' onSubmit={e => void submitRegister(e)}>
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
				)}
			</section>
		</div>
	)
}
