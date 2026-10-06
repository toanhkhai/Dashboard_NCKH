import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Khởi tạo Context
const AuthContext = createContext(null);

const STORAGE_USER_KEY = 'ctump_auth_user';
const STORAGE_CLIENT_ID_KEY = 'ctump_google_client_id';

/**
 * Hàm giải mã JWT an toàn hỗ trợ đầy đủ ký tự UTF-8 (tiếng Việt có dấu)
 */
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Lỗi giải mã Google ID Token:', error);
    return null;
  }
}

export function AuthProvider({ children }) {
  // Lấy Client ID từ file .env hoặc localStorage (nếu người dùng nhập trực tiếp trên UI)
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const [clientId, setClientId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_CLIENT_ID_KEY);
    return saved || envClientId;
  });

  // State thông tin người dùng
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Kiểm tra xem Client ID đã được cấu hình hợp lệ chưa
  const isConfigured = Boolean(
    clientId &&
    clientId.trim() !== '' &&
    !clientId.includes('your_client_id') &&
    clientId.includes('.apps.googleusercontent.com')
  );

  // Cập nhật và lưu Client ID tùy biến
  const updateClientId = (newId) => {
    const trimmed = (newId || '').trim();
    setClientId(trimmed);
    if (trimmed) {
      localStorage.setItem(STORAGE_CLIENT_ID_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_CLIENT_ID_KEY);
    }
  };

  // Đăng nhập bằng Google Credential (JWT)
  const loginWithCredential = useCallback((credential) => {
    const payload = parseJwt(credential);
    if (!payload || !payload.email) {
      throw new Error('Không thể trích xuất thông tin người dùng từ Google Token.');
    }

    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
      hd: payload.hd || '', // Hosted domain (vd: ctump.edu.vn)
      loginAt: new Date().toISOString(),
      isGuest: false,
    };

    setUser(userData);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
    return userData;
  }, []);

  // Chế độ đăng nhập xem trước (Khách thử nghiệm)
  const loginAsGuest = useCallback(() => {
    const guestUser = {
      id: 'guest_' + Date.now(),
      email: 'khach.demo@ctump.edu.vn',
      name: 'Khách Tham Quan (Demo)',
      picture: '',
      hd: 'ctump.edu.vn',
      loginAt: new Date().toISOString(),
      isGuest: true,
    };
    setUser(guestUser);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(guestUser));
    return guestUser;
  }, []);

  // Đăng xuất
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    // Vô hiệu hóa tính năng tự động chọn tài khoản Google của GIS
    if (window.google?.accounts?.id?.disableAutoSelect) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    clientId,
    isConfigured,
    updateClientId,
    loginWithCredential,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
