const registerUser = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('https://simuate-test-backend-1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.text(); 
        console.error('Error response:', errorData);
        try {
          const jsonErrorData = JSON.parse(errorData);
          throw new Error(jsonErrorData.message || 'Error en el registro');
        } catch {
          throw new Error('Error en el registro');
        }
      }
  
      return response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };
  
  export default registerUser;
  