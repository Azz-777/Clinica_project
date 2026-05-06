import type { DashboardStats } from '../types/app'

type Props = {
	stats: DashboardStats | null
}

export default function DashboardPage({ stats }: Props) {
	if (!stats) return null

	return (
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
	)
}
