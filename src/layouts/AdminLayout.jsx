import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, ShieldCheck, Users, Calendar, DollarSign, Plane, Megaphone,
  ChevronDown, ChevronRight, Clock, CheckCircle2, XCircle, LayoutGrid,
  CalendarClock, History, Heart, TrendingUp, Navigation, Hotel, Briefcase,
  Activity, GraduationCap,
} from 'lucide-react';
import { logout } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  {
    key: 'members', label: 'Members', icon: Users, prefix: '/admin/members',
    children: [
      { label: 'Pending',   icon: Clock,        to: '/admin/members',           end: true },
      { label: 'Approved',  icon: CheckCircle2, to: '/admin/members/approved' },
      { label: 'Rejected',  icon: XCircle,      to: '/admin/members/rejected' },
      { label: 'Dept-wise', icon: LayoutGrid,   to: '/admin/members/dept-wise' },
    ],
  },
  {
    key: 'events', label: 'Events', icon: Calendar, prefix: '/admin/events',
    children: [
      { label: 'Current Meet Reg', icon: CalendarClock, to: '/admin/events/current' },
      { label: 'Old Meet Reg',     icon: History,       to: '/admin/events/old' },
    ],
  },
  {
    key: 'finances', label: 'Finances', icon: DollarSign, prefix: '/admin/finances',
    children: [
      { label: 'Donations',     icon: Heart,      to: '/admin/finances/donations' },
      { label: 'Contributions', icon: TrendingUp, to: '/admin/finances/contributions' },
    ],
  },
  {
    key: 'travel', label: 'Travel', icon: Plane, prefix: '/admin/travel',
    children: [
      { label: 'Plans',         icon: Navigation, to: '/admin/travel/plans' },
      { label: 'Accommodation', icon: Hotel,      to: '/admin/travel/accommodation' },
    ],
  },
  {
    key: 'posts', label: 'Posts', icon: Megaphone, prefix: '/admin/posts',
    children: [
      { label: 'Jobs',           icon: Briefcase,     to: '/admin/posts/jobs' },
      { label: 'Activities',     icon: Activity,      to: '/admin/posts/activities' },
      { label: 'Guest Lectures', icon: GraduationCap, to: '/admin/posts/guest-lectures' },
    ],
  },
];

function NavGroup({ group }) {
  const location = useLocation();
  const isGroupActive = location.pathname.startsWith(group.prefix);
  const [open, setOpen] = useState(isGroupActive);
  const Icon = group.icon;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
          isGroupActive
            ? 'text-white bg-blue-800'
            : 'text-blue-200 hover:text-white hover:bg-blue-800'
        }`}
      >
        <Icon size={15} />
        <span className="flex-1 text-left">{group.label}</span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>

      {open && (
        <div className="ml-3 pl-3 border-l border-blue-700 space-y-0.5">
          {group.children.map(item => {
            const ChildIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? false}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white font-medium'
                      : 'text-blue-300 hover:text-white hover:bg-blue-800'
                  }`
                }
              >
                <ChildIcon size={13} />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const AdminLayout = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-blue-900 text-white h-14 flex items-center px-4 sm:px-6 justify-between shrink-0 shadow z-10">
        <div className="flex items-center gap-2 font-bold text-lg">
          <ShieldCheck size={20} />
          Admin Portal
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-blue-100 hidden sm:block">
            {userProfile?.name || userProfile?.email}
          </span>
          <span className="text-xs bg-blue-700 px-2 py-0.5 rounded">ADMIN</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      {/* Sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 shrink-0 bg-blue-900 overflow-y-auto">
          <nav className="p-3 space-y-1">
            {NAV.map(group => (
              <NavGroup key={group.key} group={group} />
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
