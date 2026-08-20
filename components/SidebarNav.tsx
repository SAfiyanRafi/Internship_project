'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserSession } from '@/lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  UsersRound, 
  Package, 
  BookOpen, 
  Receipt, 
  FileCheck2, 
  Hotel, 
  Plane, 
  DollarSign, 
  Building2, 
  UserPlus, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  ExternalLink, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface SidebarNavProps {
  user: UserSession;
}

export default function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Family / Groups', href: '/admin/groups', icon: UsersRound },
    { label: 'Hajj & Umrah Packages', href: '/admin/packages', icon: Package },
    { label: 'Bookings', href: '/admin/bookings', icon: BookOpen },
    { label: 'Payments & Receipts', href: '/admin/payments', icon: Receipt },
    { label: 'Visa Tracking', href: '/admin/visas', icon: FileCheck2 },
    { label: 'Hotels', href: '/admin/hotels', icon: Hotel },
    { label: 'Flights', href: '/admin/flights', icon: Plane },
    { label: 'Expenses & Profit', href: '/admin/expenses', icon: DollarSign },
    { label: 'Branches', href: '/admin/branches', icon: Building2, roles: ['Super Admin'] },
    { label: 'Staff & Permissions', href: '/admin/users', icon: UserPlus, roles: ['Super Admin'] },
    { label: 'Public Enquiries', href: '/admin/enquiries', icon: MessageSquare },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['Super Admin'] },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
            T
          </div>
          <span className="font-bold text-white">THABBA CRM</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* Logo & Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md shadow-amber-500/20">
              T
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight block">THABBA CRM</span>
              <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Travel Management</span>
            </div>
          </div>

          {/* User Profile Info */}
          <div className="my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="font-bold text-sm text-white truncate">{user.name}</div>
            <div className="text-xs text-amber-400/90 font-medium mt-0.5 flex items-center justify-between">
              <span>{user.role}</span>
              {user.branchName && <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{user.branchName}</span>}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.roles && !item.roles.includes(user.role)) return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
