import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export default function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Zod validation
    const validationResult = signupSchema.safeParse({ username, password });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      navigate('/investor');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 flex justify-center items-center min-h-[90vh]">
      <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-md shadow-sm">
        <h2 className="text-3xl font-extrabold mb-2 text-forest text-center">Get Started</h2>
        <p className="text-sm text-textmuted text-center mb-8">Create your free investor profile</p>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Password</label>
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
            className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-md mt-4 disabled:opacity-55"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-xs text-textmuted text-center mt-8">
          Already have an account? <Link to="/login" className="text-forest font-bold underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
