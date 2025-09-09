'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login validation
      if (formData.email === 'admin@test.com' && formData.password === 'admin123') {
        // Save auth token to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', 'mock-jwt-token-12345');
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userName', 'Admin User');
          localStorage.setItem('managedTeam', 'all'); // Admin quản lý tất cả
        }
        
        router.push('/dashboard');
      } else if (formData.email === 'webmanager@test.com' && formData.password === 'web123') {
        // Web Team Manager
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', 'mock-jwt-token-web');
          localStorage.setItem('userRole', 'manager');
          localStorage.setItem('userName', 'Web Manager');
          localStorage.setItem('managedTeam', 'web'); // Chỉ quản lý team web
        }
        
        router.push('/dashboard');
      } else if (formData.email === 'appmanager@test.com' && formData.password === 'app123') {
        // App Team Manager
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', 'mock-jwt-token-app');
          localStorage.setItem('userRole', 'manager');
          localStorage.setItem('userName', 'App Manager');
          localStorage.setItem('managedTeam', 'app'); // Chỉ quản lý team app
        }
        
        router.push('/dashboard');
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-white font-bold">BM</span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Đăng Nhập
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Chào mừng bạn quay trở lại
          </p>
        </div>

        {/* Login Form */}
        <div className="section-neumorphic p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                  style={{
                    boxShadow: 'inset 4px 4px 8px rgba(22, 17, 29, 0.1), inset -4px -4px 8px #FAFBFF'
                  }}
                  placeholder="Nhập email của bạn"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--color-background)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200 shadow-inner"
                  style={{
                    boxShadow: 'inset 4px 4px 8px rgba(22, 17, 29, 0.1), inset -4px -4px 8px #FAFBFF'
                  }}
                  placeholder="Nhập mật khẩu của bạn"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-xl hover:text-[var(--color-accent)] transition-colors duration-200"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? "🙈" : "🙉"}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[var(--color-accent)] bg-[var(--color-background)] border-[var(--color-border)] rounded focus:ring-[var(--color-accent)]"
                />
                <span className="ml-2 text-sm text-[var(--color-text-secondary)]">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full neumorphic-button py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-[var(--color-border)]"></div>
            <span className="px-4 text-sm text-[var(--color-text-secondary)]">hoặc</span>
            <div className="flex-1 border-t border-[var(--color-border)]"></div>
          </div>

          {/* Social Login */}
          <div className="mt-6 space-y-3">
            <button className="w-full py-3 px-4 rounded-xl bg-white text-gray-700 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200">
              <span>🔍</span>
              <span>Đăng nhập với Google</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-[var(--color-text-secondary)]">
              Chưa có tài khoản?{' '}
              <Link
                href="/auth/register"
                className="text-[var(--color-accent)] hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-700 font-medium mb-2">👑 Admin Account:</p>
            <p className="text-sm text-blue-600">Email: admin@test.com</p>
            <p className="text-sm text-blue-600">Password: admin123</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-2">🌐 Web Team Manager:</p>
            <p className="text-sm text-green-600">Email: webmanager@test.com</p>
            <p className="text-sm text-green-600">Password: web123</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-700 font-medium mb-2">📱 App Team Manager:</p>
            <p className="text-sm text-purple-600">Email: appmanager@test.com</p>
            <p className="text-sm text-purple-600">Password: app123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
