export const toInputDateTime = (value: string) => {
	const dt = new Date(value)
	if (Number.isNaN(dt.getTime())) return ''
	return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16)
}

export const formatDate = (value?: string | null) => {
	if (!value) return '-'
	const dt = new Date(value)
	if (Number.isNaN(dt.getTime())) return value
	return dt.toLocaleString()
}
