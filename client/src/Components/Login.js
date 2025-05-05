import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Login.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr]           = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/auth/login', { email, password });
      localStorage.setItem('dwellx_token', 'true');
      nav('/'); 
    } catch (ex) {
      setErr(ex.response?.data?.msg || 'Login failed');
    }
  }
  
  return (
    <form onSubmit={submit} className="login-form">
      <h2>Login to DwellX</h2>
      {err && <p style={{ color: 'red' }}>{err}</p>}
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
      <button type="submit">Login</button>
    </form>
  );
}