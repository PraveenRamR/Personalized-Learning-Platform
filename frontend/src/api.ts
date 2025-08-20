import axios from "axios"

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
})

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token")
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

export async function login(username: string, password: string) {
	const res = await api.post("/token/", { username, password })
	return res.data
}

export async function register(userData: {
	username: string
	password: string
	email?: string
	first_name?: string
	last_name?: string
}) {
	const res = await api.post("/users/register/", userData)
	return res.data
}

export async function fetchRecommendations(token: string) {
	const res = await api.get("/recommendations/personalized/", {
		headers: { Authorization: `Bearer ${token}` }
	})
	return res.data
}

export async function triggerRecommendationRefresh(token: string) {
	const res = await api.post("/recommendations/trigger_refresh/", {}, {
		headers: { Authorization: `Bearer ${token}` }
	})
	return res.data
}

// This endpoint doesn't exist, but we're keeping the function for compatibility
export async function getRecommendationStatus(token: string) {
	// Just return empty object instead of making an API call to a non-existent endpoint
	return {}
}

export async function listContent(token: string) {
	const res = await api.get("/content-items/", {
		headers: { Authorization: `Bearer ${token}` }
	})
	return res.data
}

export async function createContentItem(token: string, data: {
	title: string
	description: string
	content_type: 'article' | 'video' | 'quiz'
	url?: string
	tags?: string[]
}) {
	const res = await api.post("/content-items/", data, { headers: { Authorization: `Bearer ${token}` } })
	return res.data
}

export async function updateProfile(token: string, data: any) {
	const res = await api.patch("/profiles/me/", data, { headers: { Authorization: `Bearer ${token}` } })
	return res.data
}

export async function createInteraction(token: string, data: any) {
	// Ensure content_item is a valid number
	if (isNaN(data.content_item) || !data.content_item) {
		throw new Error('Invalid content_item ID');
	}
	
	// We no longer need to send the user ID, the backend will use the authenticated user
	// Add context field to fix the NOT NULL constraint error
	const payload = {
		...data,
		content_item: parseInt(data.content_item),
		context: {} // Empty object for context
	};
	
	console.log('Sending payload:', payload);
	
	try {
		// Manually check the token for debugging
		console.log('Token being used:', token);
		console.log('Token from localStorage:', localStorage.getItem('token'));
		
		// Use the token provided by AuthContext
		const res = await api.post("/interactions/", payload, { 
			headers: { 
				Authorization: `Bearer ${token}`
			} 
		});
		console.log('Interaction success response:', res.data);
		return res.data;
	} catch (error: any) {
		console.error('Interaction API error:', error);
		console.error('Error response data:', error.response?.data);
		console.error('Error status:', error.response?.status);
		console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
		throw error;
	}
}

export async function getProfile(token: string) {
	const res = await api.get("/profiles/me/", { headers: { Authorization: `Bearer ${token}` } })
	return res.data
}

// Polling function to replace WebSockets
export async function pollForRecommendationUpdates(token: string, callback: () => void) {
	// Instead of checking status, just invalidate the query to refresh recommendations
	callback()
}
