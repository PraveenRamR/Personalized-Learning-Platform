import { api } from './apiClient';

export async function listContent(token: string) {
  const res = await api.get("/content-items/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function createContentItem(token: string, data: {
  title: string;
  description: string;
  content_type: 'article' | 'video' | 'quiz';
  url?: string;
  tags?: string[];
}) {
  const res = await api.post("/content-items/", data, { 
    headers: { Authorization: `Bearer ${token}` } 
  });
  return res.data;
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
