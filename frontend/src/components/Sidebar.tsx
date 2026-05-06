import type { PanelRole, Tab } from '../types/app'

type Props = {
	activeTab: Tab
	setActiveTab: (tab: Tab) => void
	tabLabel: Record<Tab, string>
	visibleTabs: Tab[]
	panelRole: PanelRole
}

export default function Sidebar({
	activeTab,
	setActiveTab,
	tabLabel,
	visibleTabs,
	panelRole,
}: Props) {
	return (
		<aside className='left-panel'>
			<h1>{panelRole === 'admin' ? 'Admin Panel' : 'Cashier Panel'}</h1>
			<p>
				{panelRole === 'admin'
					? 'Klinika jarayonlarini toliq boshqarish paneli.'
					: 'Bemorlar va qabul yozuvlari bilan ishlash paneli.'}
			</p>
			<nav>
				{visibleTabs.map(tab => (
					<button
						key={tab}
						type='button'
						className={activeTab === tab ? 'active' : ''}
						onClick={() => setActiveTab(tab)}
					>
						{tabLabel[tab]}
					</button>
				))}
			</nav>
		</aside>
	)
}
