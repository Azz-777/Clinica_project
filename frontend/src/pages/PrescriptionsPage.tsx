import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Prescription } from '../types/app'

type PrescriptionForm = {
	id: number
	app_id: string
	diagnos_desc: string
	doktor: string
}

type Props = {
	prescriptionForm: PrescriptionForm
	setPrescriptionForm: Dispatch<SetStateAction<PrescriptionForm>>
	resetPrescriptionForm: () => void
	submitPrescription: (e: FormEvent) => Promise<void>
	prescriptions: Prescription[]
	removeRow: (url: string, onDone: () => Promise<void>) => Promise<void>
	loadPrescriptions: () => Promise<void>
}

export default function PrescriptionsPage({
	prescriptionForm,
	setPrescriptionForm,
	resetPrescriptionForm,
	submitPrescription,
	prescriptions,
	removeRow,
	loadPrescriptions,
}: Props) {
	return (
		<section>
			<form className='editor-form' onSubmit={e => void submitPrescription(e)}>
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
						setPrescriptionForm(p => ({ ...p, diagnos_desc: e.target.value }))
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
	)
}
