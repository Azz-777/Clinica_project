import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Doctor } from '../types/app'

type Props = {
	doctorForm: { id: number; name: string; psw: string }
	setDoctorForm: Dispatch<
		SetStateAction<{ id: number; name: string; psw: string }>
	>
	resetDoctorForm: () => void
	submitDoctor: (e: FormEvent) => Promise<void>
	doctors: Doctor[]
	removeRow: (url: string, onDone: () => Promise<void>) => Promise<void>
	loadDoctors: () => Promise<void>
}

export default function DoctorsPage({
	doctorForm,
	setDoctorForm,
	resetDoctorForm,
	submitDoctor,
	doctors,
	removeRow,
	loadDoctors,
}: Props) {
	return (
		<section>
			<form className='editor-form' onSubmit={e => void submitDoctor(e)}>
				<input
					required
					placeholder='Doktor ismi'
					value={doctorForm.name}
					onChange={e => setDoctorForm(p => ({ ...p, name: e.target.value }))}
				/>
				<input
					required={!doctorForm.id}
					placeholder={doctorForm.id ? 'Parol (ixtiyoriy)' : 'Parol'}
					value={doctorForm.psw}
					onChange={e => setDoctorForm(p => ({ ...p, psw: e.target.value }))}
				/>
				<button type='submit'>{doctorForm.id ? 'Saqlash' : 'Qo‘shish'}</button>
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
	)
}
