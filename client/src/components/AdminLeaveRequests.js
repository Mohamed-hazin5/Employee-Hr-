import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building2,
  Users,
  FileText,
  User,
  BarChart3,
  Filter
} from 'lucide-react';

function AdminLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const userDepartment = localStorage.getItem('department'); // Retrieve department from localStorage

  useEffect(() => {
    fetchLeaveRequests();
  }, [userDepartment]); // Add userDepartment to dependency array to re-fetch if it changes

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      // Pass department as a query parameter
      const res = await axios.get(`http://localhost:5050/api/admin/leave-requests?department=${userDepartment}`);
      // Filter out approved and rejected leaves
      const pendingRequests = res.data.filter(request => request.status.toLowerCase() === 'pending');
      setLeaveRequests(pendingRequests);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (email, startDate, status) => {
    try {
      await axios.post('http://localhost:5050/api/admin/update-leave-status', { email, startDate, status });
      alert('Leave status updated successfully!');
      fetchLeaveRequests();
    } catch (err) {
      console.error('Error updating leave status:', err);
      alert('Failed to update leave status.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'casual':
        return 'bg-blue-100 text-blue-800';
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'earned':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar, active: true },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar },
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Leave Requests</h1>
              <p className="text-slate-600 mt-1">Review and manage employee leave applications</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-3 py-2 bg-slate-100 rounded-lg">
                <Filter className="w-4 h-4 text-slate-500 mr-2" />
                <span className="text-sm text-slate-600">All Requests</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Leave Requests */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Pending Leave Requests</h2>
                </div>
              </div>

              <div className="p-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading leave requests...</p>
                  </div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Leave Requests</h3>
                    <p className="text-slate-500">All leave requests have been processed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Employee</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Leave Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Duration</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Reason</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveRequests.map((request, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-medium text-slate-900">{request.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLeaveTypeColor(request.leaveType)}`}>
                                {request.leaveType}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="text-sm">
                                <div className="font-medium text-slate-900">{request.startDate}</div>
                                <div className="text-slate-500">to {request.endDate}</div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{request.reason}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(request.status)}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleStatusChange(request.email, request.startDate, 'Approved')}
                                  className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleStatusChange(request.email, request.startDate, 'Rejected')}
                                  className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </button>
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

export default AdminLeaveRequests;