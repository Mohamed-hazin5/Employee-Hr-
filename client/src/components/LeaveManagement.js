import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building2,
  Home,
  User,
  Plus
} from 'lucide-react';

function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canApplyCasualLeave, setCanApplyCasualLeave] = useState(true); // New state for casual leave limit

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchLeaves(userData.email);
    }
  }, []);

  const fetchLeaves = async (email) => {
    try {
      const res = await axios.post('http://localhost:5050/api/leaves', { email });
      setLeaves(res.data);

      // Check for casual leave limit
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const casualLeaveThisMonth = res.data.some(leave => {
        const leaveDate = new Date(leave.startDate);
        return leave.leaveType === 'Casual' && 
               leaveDate.getMonth() === currentMonth && 
               leaveDate.getFullYear() === currentYear &&
               (leave.status === 'Approved' || leave.status === 'Pending'); // Consider both approved and pending
      });
      setCanApplyCasualLeave(!casualLeaveThisMonth);

    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  const handleLeaveApplication = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const leaveData = {
      email: user.email,
      leaveType,
      startDate,
      endDate,
      reason,
      department: user.department, // Add department here
    };

    try {
      await axios.post('http://localhost:5050/api/apply-leave', leaveData);
      alert('Leave applied successfully!');
      fetchLeaves(user.email);
      setLeaveType('Casual');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      console.error('Error applying for leave:', err);
      alert('Failed to apply for leave.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setLeaveType('Casual');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/leave', label: 'Leave Management', icon: Calendar, active: true },
    { href: '/timesheet', label: 'Timesheet', icon: Clock },
    { href: '/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/payslips', label: 'Payslips', icon: FileText },
    { href: '/documents', label: 'Document Request', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-slate-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg border-r border-neutral-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 px-6 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-500 rounded-lg flex items-center justify-center">
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
                      ? 'bg-slate-100 text-slate-900 border-r-2 border-slate-700'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${item.active ? 'text-slate-700' : 'text-neutral-400 group-hover:text-slate-700'}`} />
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
        <header className="bg-white shadow border-b border-neutral-200 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
            <p className="text-neutral-500 mt-1">Apply for leave and track your leave history</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Apply for Leave */}
            <div className="bg-white rounded-2xl shadow border border-neutral-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-500 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Apply for Leave</h2>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleLeaveApplication} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Leave Type
                      </label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 bg-white text-slate-900 placeholder-neutral-500"
                      >
                        <option value="Casual" disabled={!canApplyCasualLeave}>Casual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Earned">Earned Leave</option>
                      </select>
                      {!canApplyCasualLeave && (
                        <p className="text-sm text-red-500 mt-1">
                          You have already applied for casual leave this month.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]} // Set min date to today
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 bg-white text-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        min={startDate} // Set min date to the selected start date
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 bg-white text-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Reason for Leave
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        rows={4}
                        placeholder="Please provide a detailed reason for your leave request..."
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-slate-600 bg-white text-slate-900 placeholder-neutral-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleClearForm}
                      className="flex items-center px-6 py-3 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 focus:ring-4 focus:ring-slate-100 transition-all duration-200"
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-3 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Leave Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-2xl shadow border border-neutral-200 overflow-hidden">
              <div className="bg-gradient-to-r from-neutral-700 to-neutral-800 px-8 py-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Leave History</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setLeaves([])} // Directly clear the leaves state
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-neutral-600 rounded-lg hover:bg-neutral-700 focus:ring-4 focus:ring-neutral-500 transition-all duration-200"
                >
                  Clear History
                </button>
              </div>

              <div className="p-8">
                {leaves.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No Leave Records</h3>
                    <p className="text-neutral-500">You haven't applied for any leave yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Leave Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Start Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">End Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Reason</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.map((leave, index) => (
                          <tr key={index} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                                {leave.leaveType}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-900">{leave.startDate}</td>
                            <td className="py-4 px-4 text-slate-900">{leave.endDate}</td>
                            <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{leave.reason}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(leave.status)}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(leave.status)}`}>
                                  {leave.status}
                                </span>
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

export default LeaveManagement;