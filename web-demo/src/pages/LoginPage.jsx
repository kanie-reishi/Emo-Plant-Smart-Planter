import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@emoplant.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Đăng nhập Google thất bại.');
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
          <h2 className="text-2xl font-bold text-text">Chào mừng trở lại</h2>
          <p className="text-muted text-sm mt-1">Đăng nhập vào Emo Plant</p>
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
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full mt-2 justify-center"
          >
            Đăng nhập
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="px-3 text-sm text-muted">Hoặc</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '4px 10px', 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB', 
              borderRadius: '24px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#4B5563',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="G" 
              style={{ width: '14px', height: '14px', marginRight: '6px' }} 
            />
            Đăng nhập bằng Google
          </button>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Chưa có tài khoản? <Link to="/register" className="text-primary font-medium hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
