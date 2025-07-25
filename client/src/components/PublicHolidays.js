import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Building2,
  Home,
  PartyPopper,
  CalendarDays
} from 'lucide-react';

function PublicHolidays() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await axios.get('http://localhost:5050/api/holidays');
      setHolidays(res.data);
    } catch (err) {
      console.error('Error fetching holidays:', err);
    }
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/leave', label: 'Leave Management', icon: Calendar },
    { href: '/timesheet', label: 'Timesheet', icon: Clock },
    { href: '/holidays', label: 'Public Holidays', icon: Calendar, active: true },
    { href: '/payslips', label: 'Payslips', icon: FileText },
    { href: '/documents', label: 'Document Request', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">ELPL Portal</h2>
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
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Public Holidays</h1>
            <p className="text-slate-600 mt-1">View upcoming public holidays and plan your schedule</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Holidays */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <PartyPopper className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Upcoming Holidays</h2>
                </div>
              </div>

              <div className="p-8">
                {holidays.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDays className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Holidays Scheduled</h3>
                    <p className="text-slate-500">Holiday information will be updated here when available.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Holiday</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holidays.map((holiday, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-orange-600" />
                                </div>
                                <span className="font-medium text-slate-900">{holiday.date}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <PartyPopper className="w-5 h-5 text-red-600" />
                                </div>
                                <span className="font-medium text-slate-900">{holiday.name}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PublicHolidays;