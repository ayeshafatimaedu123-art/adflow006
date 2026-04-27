import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from '../../lib/router';
import { Menu, X, Bell, ChevronDown, LogOut, User, LayoutDashboard, Zap, Plus, Search, HelpCircle, Phone, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../types';

export default function Navbar() {
  const { user, signOut, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)
        .then(({ data }) => setNotifications(data ?? []));
    }
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashboardPath = () => {
    if (role === 'moderator') return '/moderator';
    if (role === 'admin' || role === 'super_admin') return '/admin';
    return '/dashboard';
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    setNotifications([]);
    setNotifOpen(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore Ads' },
    { to: '/packages', label: 'Packages' },
    { to: '/categories', label: 'Categories' },
  ];

  const moreLinks = [
    { to: '/faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> },
    { to: '/contact', label: 'Contact Us', icon: <Phone className="w-4 h-4" /> },
    { to: '/terms', label: 'Terms & Policies', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-b border-gray-200/50 py-2'
          : 'bg-white/50 backdrop-blur-md border-b border-gray-100/30 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-4.5 h-4.5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              AdFlow<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1.5 px-2 bg-gray-50/50 border border-gray-100/80 rounded-full p-1 shadow-inner backdrop-blur-sm">
            {navLinks.map(link => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            {/* More Dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  moreOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
                }`}
              >
                More <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {moreOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-1.5">
                    {moreLinks.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                      >
                        <span className="text-gray-400">{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/explore"
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
            >
              <Search className="w-4 h-4" />
            </Link>

            {user ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); setMoreOpen(false); }}
                    className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">Notifications</span>
                          {notifications.length > 0 && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                              {notifications.length}
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-10 text-center flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                              <Bell className="w-5 h-5 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-semibold text-sm">All caught up!</p>
                            <p className="text-gray-500 text-xs mt-1">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="px-5 py-3.5 border-b border-gray-50 hover:bg-blue-50/50 transition-colors cursor-default">
                              <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); setMoreOpen(false); }}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                      {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <span className="text-sm font-bold text-gray-700 hidden sm:block">
                      {user.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mt-0.5">{role}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to={dashboardPath()}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Profile Settings
                        </Link>
                      </div>
                      <div className="p-2 border-t border-gray-100 bg-red-50/30">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-100 text-sm font-semibold text-red-600 w-full text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/dashboard/create-ad"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Post Ad
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-gray-600 hover:text-gray-900 px-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  Sign Up
                </Link>
                <Link
                  to="/register"
                  className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Post Ad
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-in slide-in-from-top-4 fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-2 space-y-1">
                {[...navLinks, ...moreLinks].map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                      location.pathname === link.to ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                {user ? (
                  <Link
                    to="/dashboard/create-ad"
                    onClick={() => setMenuOpen(false)}
                    className="flex justify-center items-center gap-2 w-full py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    Post New Ad
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link to="/login" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-bold text-center border-2 border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50">
                      Log In
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="py-3 text-sm font-bold text-center bg-gray-900 text-white rounded-2xl hover:bg-black">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
