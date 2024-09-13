const API_URL = 'https://simuate-test-backend-1.onrender.com/api/auth/login';

const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.text(); 
      console.error('Error response:', errorData);
      try {
        const jsonErrorData = JSON.parse(errorData);
        throw new Error(jsonErrorData.message || 'Error en el inicio de sesión');
      } catch {
        throw new Error('Error en el inicio de sesión');
      }
    }

    return response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export default loginUser;
