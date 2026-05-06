import type { Dispatch, FormEvent, SetStateAction } from 'react'

type Props = {
	submitRegister: (e: FormEvent) => Promise<void>
	authRegister: { username: string; password: string }
	setAuthRegister: Dispatch<
		SetStateAction<{ username: string; password: string }>
	>
}

export default function RegisterPage({
	submitRegister,
	authRegister,
	setAuthRegister,
}: Props) {
	return (
		<section className='register-page'>
			<div className='register-info'>
				<span className='badge'>Patient Onboarding</span>
				<h3>Clinica Care’ga tez ro‘yxatdan o‘ting</h3>
				<p>
					Yangi foydalanuvchini 1 daqiqada qo‘shing va darhol tizimga kiriting.
				</p>
				<ul>
					<li>Xavfsiz akkaunt ochish</li>
					<li>Qabul bo‘limi bilan tez integratsiya</li>
					<li>Admin dashboard bilan to‘liq boshqaruv</li>
				</ul>
			</div>
			<div className='register-card'>
				<h3>Create account</h3>
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
				<p className='switch-note'>
					Akkaunt bor bo‘lsa Login bo‘limidan kiring.
				</p>
			</div>
		</section>
	)
}
