import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  Calendar, 
  Building2,
  Home,
  Clock,
  DollarSign,
  Receipt
} from 'lucide-react';

function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchPayslips(userData.email);
    }
  }, []);

  const fetchPayslips = async (email) => {
    try {
      const res = await axios.post('http://localhost:5050/api/payslips', { email });
      setPayslips(res.data);
    } catch (err) {
      console.error('Error fetching payslips:', err);
    }
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/leave', label: 'Leave Management', icon: Calendar },
    { href: '/timesheet', label: 'Timesheet', icon: Clock },
    { href: '/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/payslips', label: 'Payslips', icon: FileText, active: true },
    { href: '/documents', label: 'Document Request', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">ELPL Portal</h2>
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
                      ? 'bg-gray-100 text-blue-800 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-700'}`} />
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
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payslips</h1>
            <p className="text-gray-600 mt-1">Download and manage your salary payslips</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            {/* Payslips */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Receipt className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Your Payslips</h2>
                </div>
              </div>

              <div className="p-8">
                {payslips.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payslips Available</h3>
                    <p className="text-gray-500">Your payslips will appear here once they are generated.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Month</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Year</th>
                          <th className="text-left py-4 px-4 font-semibold text-gray-700">Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((payslip, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-700" />
                                </div>
                                <span className="font-medium text-gray-900">{payslip.month}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-900 font-medium">{payslip.year}</td>
                            <td className="py-4 px-4">
                              <a
                                href={payslip.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
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

export default Payslips;