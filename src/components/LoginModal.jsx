import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Key, ShieldCheck, AlertTriangle } from 'lucide-react';
import { GoogleConfigModal } from './GoogleConfigModal.jsx';

export function LoginModal({ isOpen, onClose }) {
  const { clientId, isConfigured, loginWithCredential } = useAuth();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isLoadingGsi, setIsLoadingGsi] = useState(true);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let checkTimer;

    const handleCredentialResponse = (response) => {
      setLoginError(null);
      if (response?.credential) {
        try {
          loginWithCredential(response.credential);
          onClose();
        } catch (err) {
          setLoginError(err.message || 'Lỗi xử lý phản hồi từ Google');
        }
      } else {
        setLoginError('Không nhận được thông tin xác thực từ Google.');
      }
    };

    const setupGoogleButton = () => {
      if (!isConfigured) {
        setIsLoadingGsi(false);
        return;
      }

      if (window.google?.accounts?.id && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Làm trống DOM container một cách an toàn không qua React reconciliation
          while (googleButtonRef.current.firstChild) {
            googleButtonRef.current.removeChild(googleButtonRef.current.firstChild);
          }

          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300,
            locale: 'vi',
          });

          setIsLoadingGsi(false);
        } catch (error) {
          console.error('Lỗi GIS:', error);
          setIsLoadingGsi(false);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogleButton();
    } else {
      let attempts = 0;
      checkTimer = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          setupGoogleButton();
          clearInterval(checkTimer);
        } else if (attempts > 20) {
          setIsLoadingGsi(false);
          clearInterval(checkTimer);
        }
      }, 250);
    }

    return () => {
      if (checkTimer) clearInterval(checkTimer);
    };
  }, [isOpen, clientId, isConfigured, loginWithCredential, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 p-0.5 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0">
              <img src="/logo/logo.png" alt="CTUMP" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Đăng nhập hệ thống
              </h3>
              <p className="text-[11px] text-slate-500">
                Đại học Y Dược Cần Thơ (CTUMP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{loginError}</div>
            </div>
          )}

          {isConfigured ? (
            <div className="space-y-3 flex flex-col items-center">
              {/* Spinner nằm ngoài container của Google Button để không xung đột React DOM */}
              {isLoadingGsi && (
                <div className="text-xs text-slate-500 flex items-center gap-2 py-3">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Đang nạp nút Google Sign-In...</span>
                </div>
              )}

              {/* Container nút Google: Hoàn toàn rỗng đối với React */}
              <div
                ref={googleButtonRef}
                className="min-h-[44px] flex items-center justify-center w-full"
              />

              <p className="text-[11px] text-slate-500 text-center">
                Đăng nhập bằng tài khoản <span className="font-semibold text-slate-700">@ctump.edu.vn</span> hoặc tài khoản được ủy quyền.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2.5 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Key className="w-4 h-4 text-amber-600" />
                <span>Chưa cấu hình Google Client ID</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Để kích hoạt đăng nhập Google, vui lòng cấu hình OAuth Client ID trong file <code>.env</code>.
              </p>
              <button
                onClick={() => setShowConfigModal(true)}
                className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs transition-colors"
              >
                Cấu hình Google Client ID
              </button>
            </div>
          )}

          {/* Thông tin quy định đăng nhập chuẩn hệ thống trường học */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Quy định truy cập hệ thống</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-500 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>
                  <strong>Cán bộ, giảng viên:</strong> Sử dụng tài khoản email <code className="text-slate-700 font-mono text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">@ctump.edu.vn</code> để tra cứu các công trình cá nhân.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>
                  <strong>Ban quản lý & Ủy quyền:</strong> Được cấp quyền tra cứu toàn bộ cơ sở dữ liệu công bố khoa học của nhà trường.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Xác thực an toàn qua Google OAuth 2.0</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      <GoogleConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
    </div>
  );
}
