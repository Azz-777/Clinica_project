import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Patient } from '../types/app'
import { formatDate } from '../utils/date'

type PatientForm = {
	id: number
	name: string
	phone: string
	birth_date: string
	gender: string
	address: string
}

type Props = {
	patientForm: PatientForm
	setPatientForm: Dispatch<SetStateAction<PatientForm>>
	resetPatientForm: () => void
	submitPatient: (e: FormEvent) => Promise<void>
	patients: Patient[]
	removeRow: (url: string, onDone: () => Promise<void>) => Promise<void>
	loadPatients: () => Promise<void>
}

export default function PatientsPage({
	patientForm,
	setPatientForm,
	resetPatientForm,
	submitPatient,
	patients,
	removeRow,
	loadPatients,
}: Props) {
	return (
		<section>
			<form className='editor-form' onSubmit={e => void submitPatient(e)}>
				<input
					required
					placeholder='Ism'
					value={patientForm.name}
					onChange={e => setPatientForm(p => ({ ...p, name: e.target.value }))}
				/>
				<input
					placeholder='Telefon'
					value={patientForm.phone}
					onChange={e => setPatientForm(p => ({ ...p, phone: e.target.value }))}
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
				<button type='submit'>{patientForm.id ? 'Saqlash' : 'Qo‘shish'}</button>
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
											birth_date: p.birth_date ? p.birth_date.slice(0, 10) : '',
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
										void removeRow(`/admin/patients/${p.id}`, loadPatients)
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
