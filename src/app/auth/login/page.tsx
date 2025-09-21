'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const { user, token } = result.data;
        
        console.log('Login successful, user:', user);
        console.log('Login successful, token:', token);
        
        // Save auth data to localStorage with token included
        if (typeof window !== 'undefined') {
          const userData = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar,
            token: token // Include token in userData object
          };
          
          console.log('Saving userData to localStorage:', userData);
          localStorage.setItem('userData', JSON.stringify(userData));
          
          // Also save individual items for backward compatibility
          localStorage.setItem('authToken', token);
          localStorage.setItem('userRole', user.role);
          localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
          localStorage.setItem('userId', user._id);
          localStorage.setItem('userEmail', user.email);
          
          // Set auth cookie for server-side authentication
          document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          
          // Set managed team based on user's field or teams
          if (user.role === 'admin') {
            localStorage.setItem('managedTeam', 'all');
          } else if (user.field === 'Web') {
            localStorage.setItem('managedTeam', 'web');
          } else if (user.field === 'App') {
            localStorage.setItem('managedTeam', 'app');
          } else {
            localStorage.setItem('managedTeam', user.teams?.[0] || '');
          }
        }
        
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'team_leader':
            router.push('/team_leader/dashboard');
            break;
          case 'member':
            router.push('/member/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error);
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
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Image src="/favicon/web-app-manifest-512x512.png" alt="TeamHub Logo" width={100} height={100} />
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
            <button className="w-full py-3 px-4 rounded-xl bg-white text-gray-700 font-medium flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors duration-200 shadow-sm border border-gray-200 cursor-pointer">
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
            <p className="text-sm text-blue-700 font-medium mb-2">👑 Team Leader Web:</p>
            <p className="text-sm text-blue-600">Email: leader.web@bcn.com</p>
            <p className="text-sm text-blue-600">Password: leader123</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-2">📱 Team Leader App:</p>
            <p className="text-sm text-green-600">Email: leader.app@bcn.com</p>
            <p className="text-sm text-green-600">Password: leader123</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <p className="text-sm text-purple-700 font-medium mb-2">� Member Web:</p>
            <p className="text-sm text-purple-600">Email: member1@bcn.com</p>
            <p className="text-sm text-purple-600">Password: member123</p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-700 font-medium mb-2">👤 Member App:</p>
            <p className="text-sm text-orange-600">Email: member3@bcn.com</p>
            <p className="text-sm text-orange-600">Password: member123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
