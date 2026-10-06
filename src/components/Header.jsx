import React, { useState } from 'react';
import { AlertCircle, LogOut, Key, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { GoogleConfigModal } from './GoogleConfigModal.jsx';

export const Header = ({
  activeTab = 'source1',
  onTabChange,
  recordCount = 0,
  source1Count = 0,
  source2Count = 0,
  lastUpdated = null,
  loading = false,
  error = null,
}) => {
  const { user, logout, isConfigured } = useAuth();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Top Row: Brand + User Profile + Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5">
            {/* Logo & Portal Title */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 flex items-center justify-center shrink-0 p-0.5 bg-white border border-slate-200/80 rounded-lg shadow-xs overflow-hidden">
                <img
                  src="/logo/logo.png"
                  alt="Logo CTUMP"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-base font-black text-slate-800 tracking-tight uppercase">
                    Dashboard Nghiên Cứu Khoa Học - Trường Đại Học Y Dược Cần Thơ
                  </h1>
                  {error && (
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-red-100 text-red-600 border border-red-200 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Lỗi kết nối Sheet
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Hệ thống quản lý & trực quan hóa dữ liệu công bố khoa học
                </p>
              </div>
            </div>

            {/* User Profile & Actions */}
            {user && (
              <div className="flex items-center gap-2.5 self-end md:self-auto shrink-0">
                {/* User info badge */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                  )}

                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.isGuest ? (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-amber-100 text-amber-700 rounded border border-amber-200">
                          Demo
                        </span>
                      ) : (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded border border-emerald-200 flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5" /> Google
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[170px]">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Google Config button */}
                <button
                  onClick={() => setShowConfigModal(true)}
                  title="Cấu hình Google Cloud Console"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <Key className="w-4 h-4 text-blue-600" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={() => setShowConfirmLogout(true)}
                  title="Đăng xuất khỏi hệ thống"
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirm Logout Modal */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900">Xác nhận đăng xuất</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản{' '}
              <strong className="text-slate-800">{user?.email}</strong>? Bạn sẽ cần đăng nhập lại bằng Google để truy cập tiếp.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowConfirmLogout(false);
                  logout();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Cloud Configuration Modal */}
      <GoogleConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  );
};
