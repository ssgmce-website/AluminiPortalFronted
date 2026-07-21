import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LogOut, Clock, CheckCircle2, XCircle, LayoutGrid, CalendarClock, History,
  Heart, TrendingUp, Navigation, Hotel, Briefcase, Activity,
  GraduationCap, LayoutDashboard, Search, Bell, Sun, Moon, User,
  MessageSquareQuote, MessageSquare,
} from 'lucide-react';
import { adminLogout } from '../services/adminAuth';
import { fetchRequests } from '../services/adminService';
import logo from '../assets/logo.png';
import '../styles/admin-dark.css';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', end: true },
    ],
  },
  {
    label: 'Members',
    items: [
      { label: 'Pending', icon: Clock, to: '/admin/members', end: true },
      { label: 'Approved', icon: CheckCircle2, to: '/admin/members/approved' },
      { label: 'Rejected', icon: XCircle, to: '/admin/members/rejected' },
      { label: 'Dept-wise', icon: LayoutGrid, to: '/admin/members/dept-wise' },
    ],
  },
  {
    label: 'Events',
    items: [
      { label: 'Current Meet Reg', icon: CalendarClock, to: '/admin/events/current' },
      { label: 'Old Meet Reg', icon: History, to: '/admin/events/old' },
    ],
  },
  {
    label: 'Feedbacks',
    items: [
      { label: 'Alumni Feedbacks', icon: MessageSquareQuote, to: '/admin/feedbacks/alumni' },
      { label: 'Public Feedbacks', icon: MessageSquare, to: '/admin/feedbacks/public' },
    ],
  },
  {
    label: 'Finances',
    items: [
      { label: 'Donations', icon: Heart, to: '/admin/finances/donations' },
      { label: 'Contributions', icon: TrendingUp, to: '/admin/finances/contributions' },
    ],
  },
  {
    label: 'Travel',
    items: [
      { label: 'Plans', icon: Navigation, to: '/admin/travel/plans' },
      { label: 'Accommodation', icon: Hotel, to: '/admin/travel/accommodation' },
    ],
  },
  {
    label: 'Posts',
    items: [
      { label: 'Jobs', icon: Briefcase, to: '/admin/posts/jobs' },
      { label: 'Activities', icon: Activity, to: '/admin/posts/activities' },
      { label: 'Guest Lectures', icon: GraduationCap, to: '/admin/posts/guest-lectures' },
    ],
  },
];


export const AdminLayout = () => {
  const navigate = useNavigate();

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('adminTheme') === 'dark'; }
    catch { return false; }
  });
  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('adminTheme', next ? 'dark' : 'light'); }
      catch { }
      return next;
    });
  };

  // ── Notifications ──────────────────────────────────────────────────────────
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('adminNotifRead') || '[]')); }
    catch { return new Set(); }
  });
  const notifRef = useRef(null);

  useEffect(() => {
    fetchRequests('pending')
      .then(data => {
        const items = (data.requests || []).map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email || '',
          branch: u.branch || '',
          initial: (u.name?.[0] || '?').toUpperCase(),
          date: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString('en-IN')
            : '',
        }));
        setNotifs(items);
      })
      .catch(() => { });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showNotif) return;
    const handler = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotif]);

  const unreadCount = notifs.filter(n => !readIds.has(n.id)).length;

  const markAllRead = () => {
    const all = new Set(notifs.map(n => n.id));
    setReadIds(all);
    try { localStorage.setItem('adminNotifRead', JSON.stringify([...all])); }
    catch { }
  };

  const markRead = id => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem('adminNotifRead', JSON.stringify([...next])); }
      catch { }
      return next;
    });
  };

  // ── User dropdown ─────────────────────────────────────────────────────────
  const [showUser, setShowUser] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    if (!showUser) return;
    const handler = e => {
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUser]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login', { replace: true });
  };

  const initials = 'A';

  return (
    <div
      data-admin-theme={isDark ? 'dark' : 'light'}
      className="min-h-screen flex flex-col bg-gray-50"
    >

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 h-14 flex items-center shrink-0 z-20">

        {/* Brand */}
        <div className="w-52 shrink-0 flex items-center gap-3 px-4 h-full border-r border-gray-200">
          <img src={logo} alt="SSGMCE" className="h-9 w-9 rounded-lg object-contain shrink-0" />
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">SSGMCE</p>
            <p className="text-[10px] text-gray-400 truncate">Alumni Connect</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 px-5 max-w-sm">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-2 px-4">

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* ── Notification bell + dropdown ──────────────────────────────── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(prev => !prev)}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">

                {/* Dropdown header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                {notifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <Bell size={26} className="mb-2 opacity-30" />
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifs.map(n => {
                      const isUnread = !readIds.has(n.id);
                      return (
                        <Link
                          key={n.id}
                          to="/admin/members"
                          onClick={() => { markRead(n.id); setShowNotif(false); }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50/40' : ''}`}
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0 mt-0.5">
                            {n.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{n.name}</p>
                            <p className="text-xs text-gray-500 truncate">
                              Awaiting approval{n.branch ? ` · ${n.branch}` : ''}
                            </p>
                            {n.date && (
                              <p className="text-[11px] text-gray-400 mt-0.5">{n.date}</p>
                            )}
                          </div>
                          {isUnread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Footer link */}
                {notifs.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                    <Link
                      to="/admin/members"
                      onClick={() => setShowNotif(false)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      View all pending requests →
                    </Link>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* ── User menu ─────────────────────────────────────────────────── */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUser(prev => !prev)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <p className="text-sm font-semibold text-gray-800 leading-none">Admin</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Super Admin</p>
              </div>
            </button>

            {showUser && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden py-1">
                {/* Identity */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-400 mt-0.5">Super Admin</p>
                </div>
                {/* Sign out */}
                <button
                  onClick={() => { setShowUser(false); handleLogout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">

          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
            {NAV_SECTIONS.map(section => (
              <div key={section.label}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1.5">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end ?? false}
                        className={({ isActive }) => {
                          const base = 'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-200';
                          if (isActive) {
                            return `${base} font-semibold ${isDark
                                ? 'bg-white text-[#13152c] shadow-sm'
                                : 'bg-[#1b1e36] text-white shadow-sm'
                              }`;
                          }
                          return `${base} ${isDark
                              ? 'text-[#9da0be] hover:bg-white/10 hover:text-white hover:shadow-[0_2px_10px_rgba(0,0,0,0.35)]'
                              : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-md'
                            }`;
                        }}
                      >
                        <Icon size={14} className="shrink-0" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-[10px] text-gray-400">Alumni Admin v1.0</p>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Light mode' : 'Dark mode'}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isDark ? <Sun size={12} /> : <Moon size={12} />}
            </button>
          </div>

        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
