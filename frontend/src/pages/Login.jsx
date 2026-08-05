import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(3, { message: "Please enter a valid email or username." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Zod validation
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to authenticate');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      if (redirectUrl === 'checkout') {
        navigate('/investor');
      } else {
        navigate(data.role === 'admin' ? '/admin' : '/investor');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    try {
      const mockGoogleToken = 'google_jwt_oauth_mock_token_' + Math.random().toString(36).substr(2, 9);
      const res = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: mockGoogleToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Google authentication failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      navigate('/investor');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 flex justify-center items-center min-h-[90vh]">
      <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-md shadow-sm">
        <h2 className="text-3xl font-extrabold mb-2 text-forest text-center">Welcome Back</h2>
        <p className="text-sm text-textmuted text-center mb-8">Access your premium advisory portal</p>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Email or Username</label>
            <input
              type="text"
              required
              placeholder="e.g. admin or investor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-semibold"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted">Password</label>
              <Link to="/forgot-password" className="text-xs text-textmuted hover:text-forest underline">Forgot password?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-md mt-2 disabled:opacity-55"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <span className="bg-white px-3 text-xs text-textmuted relative z-10">OR</span>
          <div className="absolute w-full h-px bg-bordercolor top-1/2 left-0"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full btn-white py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <p className="text-xs text-textmuted text-center mt-8">
          Don't have an account? <Link to="/signup" className="text-forest font-bold underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
