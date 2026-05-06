import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Appointment } from '../types/app'
import { formatDate, toInputDateTime } from '../utils/date'

type AppointmentForm = {
	id: number
	patient_id: string
	doctor_id: string
	datetime: string
	reason: string
	status: Appointment['status']
}

type Props = {
	appointmentForm: AppointmentForm
	setAppointmentForm: Dispatch<SetStateAction<AppointmentForm>>
	resetAppointmentForm: () => void
	submitAppointment: (e: FormEvent) => Promise<void>
	appointments: Appointment[]
	removeRow: (url: string, onDone: () => Promise<void>) => Promise<void>
	loadAppointments: () => Promise<void>
}

export default function AppointmentsPage({
	appointmentForm,
	setAppointmentForm,
	resetAppointmentForm,
	submitAppointment,
	appointments,
	removeRow,
	loadAppointments,
}: Props) {
	return (
		<section>
			<form className='editor-form' onSubmit={e => void submitAppointment(e)}>
				<input
					required
					type='number'
					placeholder='Patient ID'
					value={appointmentForm.patient_id}
					onChange={e =>
						setAppointmentForm(p => ({ ...p, patient_id: e.target.value }))
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
	)
}
