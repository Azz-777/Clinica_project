import type { Tab } from '../types/app'

type Props = {
	activeTab: Tab
	setActiveTab: (tab: Tab) => void
	tabLabel: Record<Tab, string>
}

export default function Sidebar({ activeTab, setActiveTab, tabLabel }: Props) {
	return (
		<aside className='left-panel'>
			<h1>Clinica Care</h1>
			<p>Medikal boshqaruv paneli va bemor onboarding interfeysi.</p>
			<nav>
				{(Object.keys(tabLabel) as Tab[]).map(tab => (
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
