import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import {
  Building2,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  Shield,
  LogOut,
  Home,
  Briefcase
} from 'lucide-react';

function Layout({ children, role }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  const adminNavigationItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3, active: window.location.pathname === '/admin' },
    { href: '/admin/employees', label: 'Employees', icon: Users, active: window.location.pathname === '/admin/employees' },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar, active: window.location.pathname === '/admin/leaves' },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar, active: window.location.pathname === '/admin/holidays' },
    { href: '/admin/payslips', label: 'Payslips', icon: FileText, active: window.location.pathname === '/admin/payslips' },
    { href: '/admin/document-requests', label: 'Document Requests', icon: FileText, active: window.location.pathname === '/admin/document-requests' },
    { href: '/admin/projects', label: 'Project Allocation', icon: Clock, active: window.location.pathname === '/admin/projects' },
  ];

  const employeeNavigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, active: window.location.pathname === '/dashboard' },
    { href: '/leave', label: 'Leave Management', icon: Calendar, active: window.location.pathname === '/leave' },
    { href: '/timesheet', label: 'Timesheet', icon: Clock, active: window.location.pathname === '/timesheet' },
    { href: '/holidays', label: 'Public Holidays', icon: Calendar, active: window.location.pathname === '/holidays' },
    { href: '/payslips', label: 'Payslips', icon: FileText, active: window.location.pathname === '/payslips' },
    { href: '/documents', label: 'Document Request', icon: FileText, active: window.location.pathname === '/documents' },
  ];

  const navigationItems = role === 'Admin' ? adminNavigationItems : employeeNavigationItems;
  const logoText = role === 'Admin' ? 'ELPL Admin' : 'ELPL Portal';
  const logoBgColor = role === 'Admin' ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-indigo-600';
  const activeBgColor = role === 'Admin' ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600' : 'bg-blue-50 text-blue-700 border-r-2 border-blue-600';
  const activeIconColor = role === 'Admin' ? 'text-purple-600' : 'text-blue-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${logoBgColor} rounded-lg flex items-center justify-center`}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{logoText}</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    item.active
                      ? activeBgColor
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.active ? activeIconColor : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group text-slate-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-600" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72">
        {children}
      </div>
    </div>
  );
}

export default Layout;
