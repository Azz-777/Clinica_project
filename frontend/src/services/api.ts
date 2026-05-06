const API_BASE = '/api'

export async function apiRequest<T>(
	path: string,
	init?: RequestInit,
): Promise<T> {
	const token =
		typeof window !== 'undefined' ? localStorage.getItem('token') : null

	const defaultHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
	}

	if (token) defaultHeaders['Authorization'] = `Bearer ${token}`

	const mergedHeaders = {
		...defaultHeaders,
		...(init && init.headers ? (init.headers as Record<string, string>) : {}),
	}

	const response = await fetch(`${API_BASE}${path}`, {
		...init,
		headers: mergedHeaders,
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
