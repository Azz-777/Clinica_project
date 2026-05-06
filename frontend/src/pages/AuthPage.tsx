import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { AuthUser } from '../types/app'

type Props = {
	submitLogin: (e: FormEvent) => Promise<void>
	authLogin: { username: string; password: string }
	setAuthLogin: Dispatch<SetStateAction<{ username: string; password: string }>>
	currentUser: AuthUser | null
	setActiveTabToRegister: () => void
}

export default function AuthPage({
	submitLogin,
	authLogin,
	setAuthLogin,
	currentUser,
	setActiveTabToRegister,
}: Props) {
	return (
		<section className='auth-grid'>
			<article className='auth-cover'>
				<h3>Xush kelibsiz</h3>
				<p>
					Bitta panelda klinika jarayonlari: qabul, retsept, to‘lov va hisobot.
				</p>
				<button type='button' onClick={setActiveTabToRegister}>
					Akkaunt yaratish
				</button>
			</article>
			<article className='auth-card'>
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
				<p className='switch-note'>
					Akkauntingiz yo‘qmi? Register bo‘limiga o‘ting.
				</p>
			</article>
			<article className='auth-card'>
				<h3>Current user</h3>
				<p>
					{currentUser
						? `${currentUser.username} (#${currentUser.id})`
						: 'Login qilinmagan'}
				</p>
			</article>
		</section>
	)
}
