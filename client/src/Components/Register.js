import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Register.css'; 

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');

    try {
      await api.post('/auth/register', { email, password });
      nav('/login');
    } catch (ex) {
      setErr(ex.response?.data?.msg || 'Registration failed');
    }
  }

  return (
    <div className="register-page">
      <form onSubmit={submit} className="register-form">
        <h2>Create your DwellX account</h2>
        {err && <p>{err}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}