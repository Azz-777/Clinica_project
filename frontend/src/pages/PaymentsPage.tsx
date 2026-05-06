import type { Dispatch, FormEvent, SetStateAction } from 'react'
import type { Payment } from '../types/app'

type PaymentForm = {
	id: number
	app_id: string
	amount: string
	payment_method: Payment['payment_method']
	status: Payment['status']
}

type Props = {
	paymentForm: PaymentForm
	setPaymentForm: Dispatch<SetStateAction<PaymentForm>>
	resetPaymentForm: () => void
	submitPayment: (e: FormEvent) => Promise<void>
	payments: Payment[]
	removeRow: (url: string, onDone: () => Promise<void>) => Promise<void>
	loadPayments: () => Promise<void>
}

export default function PaymentsPage({
	paymentForm,
	setPaymentForm,
	resetPaymentForm,
	submitPayment,
	payments,
	removeRow,
	loadPayments,
}: Props) {
	return (
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
				<button type='submit'>{paymentForm.id ? 'Saqlash' : 'Qo‘shish'}</button>
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
										void removeRow(`/admin/payments/${p.id}`, loadPayments)
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
