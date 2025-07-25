import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Plus, 
  DollarSign, 
  Calendar, 
  Building2,
  Users,
  BarChart3,
  Mail,
  Link,
  Receipt
} from 'lucide-react';
import { href } from 'react-router-dom';

function AdminPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [newPayslip, setNewPayslip] = useState({ email: '', month: '', year: '', url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userDepartment = localStorage.getItem('department'); // Retrieve department from localStorage

  useEffect(() => {
    fetchPayslips();
  }, [userDepartment]); // Add userDepartment to dependency array

  const fetchPayslips = async () => {
    setIsLoading(true);
    try {
      // Pass department as a query parameter
      const res = await axios.get(`http://localhost:5050/api/admin/payslips?department=${userDepartment}`);
      setPayslips(res.data);
    } catch (err) {
      console.error('Error fetching payslips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayslip({ ...newPayslip, [name]: value });
  };

  const handleAddPayslip = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('http://localhost:5050/api/admin/payslips', newPayslip);
      alert('Payslip added successfully!');
      fetchPayslips();
      setNewPayslip({ email: '', month: '', year: '', url: '' });
    } catch (err) {
      console.error('Error adding payslip:', err);
      alert('Failed to add payslip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/admin/payslips', label: 'Payslips', icon: FileText, active: true },
     { href: '/admin/document-requests', label: 'Document Requests', icon: FileText }, // New item
     {href: '/admin/projects', label: 'Project Allocation', icon: Building2, active: true }, // New item
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">ELPL Admin</h2>
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
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.active ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
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
            <h1 className="text-3xl font-bold text-slate-900">Payslip Management</h1>
            <p className="text-slate-600 mt-1">Manage employee payslips and salary documents</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Add New Payslip */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Add New Payslip</h2>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleAddPayslip} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Employee Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={newPayslip.email}
                          onChange={handleInputChange}
                          placeholder="employee@company.com"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Month
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="month"
                          value={newPayslip.month}
                          onChange={handleInputChange}
                          placeholder="January"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Year
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          name="year"
                          value={newPayslip.year}
                          onChange={handleInputChange}
                          placeholder="2024"
                          required
                          min="2020"
                          max="2030"
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Payslip URL
                      </label>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="url"
                          name="url"
                          value={newPayslip.url}
                          onChange={handleInputChange}
                          placeholder="https://drive.google.com/..."
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding Payslip...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Payslip
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* All Payslips */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Receipt className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">All Payslips</h2>
                </div>
              </div>

              <div className="p-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading payslips...</p>
                  </div>
                ) : payslips.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Payslips Found</h3>
                    <p className="text-slate-500">Start by adding payslips for your employees.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Employee</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Month</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Year</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Document</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslips.map((payslip, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Mail className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="font-medium text-slate-900">{payslip.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-slate-900">{payslip.month}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-900 font-medium">{payslip.year}</td>
                            <td className="py-4 px-4">
                              <a
                                href={payslip.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                              >
                                <Link className="w-4 h-4 mr-2" />
                                View Document
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

export default AdminPayslips;