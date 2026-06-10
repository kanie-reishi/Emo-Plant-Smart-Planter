import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.');
    }
    try {
      setError('');
      setLoading(true);
      await register(email, password);
      navigate('/');
    } catch (err) {
      setError('Đăng ký thất bại. Email có thể đã tồn tại hoặc mật khẩu quá yếu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-background items-center justify-center p-4">
      <div className="card w-full max-w-md animate-fadeIn">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-primary/30">
            <Leaf size={32} />
          </div>
          <h2 className="text-2xl font-bold text-text">Tạo tài khoản mới</h2>
          <p className="text-muted text-sm mt-1">Bắt đầu chăm sóc cây với Emo Plant</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input 
              type="email" 
              required
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Mật khẩu</label>
            <input 
              type="password" 
              required
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              required
              className="form-control" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full mt-2 justify-center"
          >
            Đăng ký
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Đã có tài khoản? <Link to="/login" className="text-primary font-medium hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
