import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  PartyPopper, 
  Building2,
  Users,
  FileText,
  BarChart3,
  CalendarDays,
  AlertTriangle
} from 'lucide-react';
import { href } from 'react-router-dom';

function AdminPublicHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5050/api/holidays');
      setHolidays(res.data);
    } catch (err) {
      console.error('Error fetching holidays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHoliday({ ...newHoliday, [name]: value });
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('http://localhost:5050/api/admin/holidays', newHoliday);
      alert('Holiday added successfully!');
      fetchHolidays();
      setNewHoliday({ date: '', name: '' });
    } catch (err) {
      console.error('Error adding holiday:', err);
      alert('Failed to add holiday.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (date) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await axios.delete(`http://localhost:5050/api/admin/holidays/${date}`);
        alert('Holiday deleted successfully!');
        fetchHolidays();
      } catch (err) {
        console.error('Error deleting holiday:', err);
        alert('Failed to delete holiday.');
      }
    }
  };

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar, active: true },
    { href: '/admin/payslips', label: 'Payslips', icon: FileText },
     { href: '/admin/document-requests', label: 'Document Requests', icon: FileText }, // New item
{href: '/admin/projects', label: 'Project Allocation', icon: Building2 }, // New item

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
            <h1 className="text-3xl font-bold text-slate-900">Public Holiday Management</h1>
            <p className="text-slate-600 mt-1">Manage company holidays and special occasions</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Add New Holiday */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Add New Holiday</h2>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleAddHoliday} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Holiday Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          name="date"
                          value={newHoliday.date}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Holiday Name
                      </label>
                      <div className="relative">
                        <PartyPopper className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={newHoliday.name}
                          onChange={handleInputChange}
                          placeholder="New Year's Day"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding Holiday...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Holiday
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Existing Holidays */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Existing Holidays</h2>
                </div>
              </div>

              <div className="p-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading holidays...</p>
                  </div>
                ) : holidays.length === 0 ? (
                  <div className="text-center py-12">
                    <PartyPopper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Holidays Scheduled</h3>
                    <p className="text-slate-500">Start by adding public holidays for your organization.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Holiday</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Actions</th>
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
                            <td className="py-4 px-4">
                              <button
                                onClick={() => handleDeleteHoliday(holiday.date)}
                                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
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

export default AdminPublicHolidays;