import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import axios from 'axios';
import { 
  Building2, 
  Users, 
  Calendar, 
  FileText,
  BarChart3,
  TrendingUp,
  Clock,
  Shield,
  LogOut,
  Mail
} from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: '-',
    pendingLeaves: '-',
    documentRequests: '-', // New stat
    systemUptime: '99.9%' // Example static value
  });
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projectForm, setProjectForm] = useState({
    employeeEmail: '',
    projectName: '',
    allocatedHours: '',
    startDate: '',
  });
  const [isAllocating, setIsAllocating] = useState(false);

  const userDepartment = localStorage.getItem('department');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
    } else {
      const userData = JSON.parse(storedUser);
      const storedRole = localStorage.getItem('role');
      setUser(userData);
      fetchProfile(userData.email, storedRole);
    }
  }, [navigate]);

  const fetchProfile = async (email, selectedRole) => {
    try {
      const res = await axios.post('http://localhost:5050/api/profile', { email, selectedRole });
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      alert('Access denied. You are not a registered admin.');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  useEffect(() => {
    const fetchStatsAndEmployees = async () => {
      if (!userDepartment) return;
      try {
        // Fetch stats
        const statsRes = await axios.get(`http://localhost:5050/api/profile/stats?department=${userDepartment}`);
        setStats({
          totalEmployees: statsRes.data.totalEmployees,
          pendingLeaves: statsRes.data.pendingLeaves,
          documentRequests: statsRes.data.documentRequests,
          systemUptime: '99.9%'
        });

        // Fetch employees for the same department
        const employeesRes = await axios.get(`http://localhost:5050/api/employees?department=${userDepartment}`);
        setEmployees(employeesRes.data);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchStatsAndEmployees();
  }, [userDepartment]);

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm({ ...projectForm, [name]: value });
  };

  const handleAllocateProject = async (e) => {
    e.preventDefault();
    setIsAllocating(true);
    try {
      await axios.post('http://localhost:5050/api/projects', { ...projectForm, department: userDepartment });
      alert('Project allocated successfully!');
      setProjectForm({
        employeeEmail: '',
        projectName: '',
        allocatedHours: '',
        startDate: '',
      });
    } catch (error) {
      console.error('Error allocating project:', error);
      alert('Failed to allocate project.');
    } finally {
      setIsAllocating(false);
    }
  };

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

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3, active: true },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/admin/payslips', label: 'Payslips', icon: FileText },
    { href: '/admin/document-requests', label: 'Document Requests', icon: FileText }, // New item
    { href: '/admin/projects', label: 'Project Allocation', icon: Clock },

  ];

  const statsCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      change: '',
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      change: '',
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Document Requests', // New Card
      value: stats.documentRequests,
      change: '',
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'System Uptime',
      value: stats.systemUptime,
      change: '',
      icon: Shield,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-slate-200">
        <div class="flex flex-col h-full">
          {/* Logo */}
          <div class="flex items-center justify-center h-20 px-6 border-b border-slate-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Building2 class="w-6 h-6 text-white" />
              </div>
              <h2 class="text-xl font-bold text-slate-800">ELPL Admin</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav class="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  class={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    item.active
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon class={`w-5 h-5 mr-3 ${item.active ? 'text-purple-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div class="px-4 py-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              class="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group text-slate-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut class="w-5 h-5 mr-3 text-slate-400 group-hover:text-red-600" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div class="ml-72">
        {/* Header */}
        <header class="bg-white shadow-sm border-b border-slate-200 px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p class="text-slate-600 mt-1">Welcome back, manage your organization and activities</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-3">
                <img 
                  src={user?.photo || 'https://via.placeholder.com/40?text=User'} 
                  alt="User" 
                  class="w-10 h-10 rounded-full border-2 border-slate-200"
                />
                <div class="hidden md:block">
                  <p class="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p class="text-xs text-slate-500">{profile?.designation}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main class="p-8">
          <div class="max-w-7xl mx-auto space-y-8">
            {/* Stats Grid */}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={index} class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-sm font-medium text-slate-600">{card.title}</p>
                        <p class="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                        <p class="text-sm text-slate-500 mt-1">{card.change}</p>
                      </div>
                      <div class={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon class={`w-6 h-6 ${card.iconColor}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Project Allocation
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Allocate Project</h2>
                </div>
              </div>
              <div className="p-8">
                <form onSubmit={handleAllocateProject} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Employee</label>
                      <select
                        name="employeeEmail"
                        value={projectForm.employeeEmail}
                        onChange={handleProjectFormChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(emp => (
                          <option key={emp.email} value={emp.email}>{emp.name} ({emp.email})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Project Name</label>
                      <input
                        type="text"
                        name="projectName"
                        value={projectForm.projectName}
                        onChange={handleProjectFormChange}
                        placeholder="e.g., Website Redesign"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Allocated Hours</label>
                      <input
                        type="number"
                        name="allocatedHours"
                        value={projectForm.allocatedHours}
                        onChange={handleProjectFormChange}
                        placeholder="e.g., 160"
                        required
                        min="1"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={projectForm.startDate}
                        onChange={handleProjectFormChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAllocating}
                      className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isAllocating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Allocating...
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Allocate Project
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div> */}

            {/* Welcome Section */}
            <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div class="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12">
                <div class="flex items-center space-x-6">
                  <div class="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Shield class="w-10 h-10 text-white" />
                  </div>
                  <div class="text-white">
                    <h2 class="text-3xl font-bold mb-2">Welcome, {profile?.name || user?.name}!</h2>
                    <p class="text-purple-100 text-lg">{profile?.designation || 'Administrator'}</p>
                    <p class="text-purple-200 text-sm mt-1">{profile?.department || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div class="p-8">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div class="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users class="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-slate-900">Admin Information</h3>
                      <p class="text-sm text-slate-600 mt-1">Add, edit, and manage employee records</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar class="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-slate-900">Leave Requests</h3>
                      <p class="text-sm text-slate-600 mt-1">Review and approve employee leave applications</p>
                    </div>
                  </div>

                  <div class="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText class="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-slate-900">Payroll Management</h3>
                      <p class="text-sm text-slate-600 mt-1">Manage payslips and salary information</p>
                    </div>
                  </div>
                </div>

                <div class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 class="text-lg font-semibold text-slate-900 mb-4">Admin Information</h4>
                  <div class="space-y-4">
                    <div class="flex items-center space-x-3">
                      <Mail class="w-5 h-5 text-blue-600" />
                      <div>
                        <p class="text-sm font-medium text-slate-500">Email Address</p>
                        <p class="text-slate-900">{user?.email}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <Users class="w-5 h-5 text-blue-600" />
                      <div>
                        <p class="text-sm font-medium text-slate-500">Position</p>
                        <p class="text-slate-900">{profile?.designation || 'N/A'}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <Building2 class="w-5 h-5 text-blue-600" />
                      <div>
                        <p class="text-sm font-medium text-slate-500">Department</p>
                        <p class="text-slate-900">{profile?.department || 'N/A'}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-3">
                      <Clock class="w-5 h-5 text-blue-600" />
                      <div>
                        <p class="text-sm font-medium text-slate-500">Contact Number</p>
                        <p class="text-slate-900">{profile?.contact || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;

