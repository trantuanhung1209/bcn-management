'use client';

import React from 'react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--color-background)] rounded-2xl p-6 w-full max-w-md section-neumorphic">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-white">🚪</span>
          </div>
          
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            Xác nhận đăng xuất
          </h2>
          
          <p className="text-[var(--color-text-secondary)] mb-6">
            Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200 cursor-pointer"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
