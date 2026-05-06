const API_BASE = '/api'

export async function apiRequest<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const response = await fetch(`${API_BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...init,
	})

	const body = await response.json().catch(() => ({}))

	if (!response.ok) {
		const message =
			(body as { message?: string; error?: string }).message ||
			(body as { message?: string; error?: string }).error ||
			'So‘rov bajarilmadi'
		throw new Error(message)
	}

	return body as T
}
