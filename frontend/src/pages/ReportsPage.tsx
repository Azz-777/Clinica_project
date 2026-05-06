import type { ReportsData } from '../types/app'

type Props = {
  reports: ReportsData | null
}

export default function ReportsPage({ reports }: Props) {
  if (!reports) return null

  return (
    <section className='reports-grid'>
      <article>
        <h3>Kunlik qabul (oxirgi 7 kun)</h3>
        <ul>
          {reports.dailyAppointments.map(row => (
            <li key={row.sana}>
              <span>{row.sana}</span>
              <b>{row.count}</b>
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h3>Top doktorlar</h3>
        <ul>
          {reports.topDoctors.map(row => (
            <li key={row.name}>
              <span>{row.name}</span>
              <b>{row.appointment_count}</b>
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h3>To‘lov usuli bo‘yicha</h3>
        <ul>
          {reports.revenueByMethod.map(row => (
            <li key={row.payment_method}>
              <span>{row.payment_method}</span>
              <b>{row.total}</b>
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h3>Oylik daromad</h3>
        <ul>
          {reports.monthlyRevenue.map(row => (
            <li key={row.month}>
              <span>{row.month}</span>
              <b>{row.total}</b>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
