export const fetchWithToken = async (url, options = {}) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  
    const response = await fetch(url, {
      ...options,
      headers,
    });
  
    if (response.status === 401) {
      console.warn("Token expired or invalid. Clearing session.");
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      window.location.href = '/'; 
    }
  
    return response;
  };