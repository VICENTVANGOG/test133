"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import loginUser from './services/authService';
import registerUser from './services/registerService';

interface User {
  name?: string;
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (user: Pick<User, 'email' | 'password'>) => void;
  error: string;
}

interface RegisterFormProps {
  onSubmit: (user: User) => void;
  error: string;
}

const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (user: Pick<User, 'email' | 'password'>) => {
    try {
      const data = await loginUser(user.email, user.password);
      localStorage.setItem('token', data.token);
      router.push('/home');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleRegister = async (user: User) => {
    try {
      await registerUser(user.name!, user.email, user.password);
      setIsLoginMode(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <>
      <div>
        <div>
          
          <div style={{ display: isLoginMode ? 'block' : 'none' }}>
            <label>Iniciar sesión</label>
            <LoginForm onSubmit={handleLogin} error={error} />
            <button onClick={() => setIsLoginMode(false)}>¿No tienes una cuenta? Regístrate</button>
          </div>
          <div style={{ display: isLoginMode ? 'none' : 'block' }}>
            <label>Registrarse</label>
            <RegisterForm onSubmit={handleRegister} error={error} />
            <button onClick={() => setIsLoginMode(true)}>¿Ya tienes una cuenta? Inicia sesión</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div>{error}</div>}
      <button type="submit">Iniciar sesión</button>
    </form>
  );
};

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div>{error}</div>}
      <button type="submit">Registrarse</button>
    </form>
  );
};
