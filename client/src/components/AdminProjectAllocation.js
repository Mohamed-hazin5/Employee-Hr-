import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Clock, Building2 } from 'lucide-react';
import { Calendar, FileText } from 'lucide-react';
function AdminProjectAllocation() {
  const [employees, setEmployees] = useState([]);
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    allocatedHours: '',
    startDate: '',
  });
  const [isAllocating, setIsAllocating] = useState(false);
  const [projectStatuses, setProjectStatuses] = useState([]);
  const userDepartment = localStorage.getItem('department');

  useEffect(() => {
    const fetchData = async () => {
      if (!userDepartment) return;
      try {
        const employeesRes = await axios.get(`http://localhost:5050/api/employees?department=${userDepartment}`);
        setEmployees(employeesRes.data);

        const projectStatusRes = await axios.get(`http://localhost:5050/api/admin/project-status?department=${userDepartment}`);
        setProjectStatuses(projectStatusRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
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

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: Building2 },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/admin/payslips', label: 'Payslips', icon: FileText },
    { href: '/admin/document-requests', label: 'Document Requests', icon: FileText },
    { href: '/admin/projects', label: 'Project Allocation', icon: Clock, active: true },
  
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
              <h2 className="text-xl font-bold text-white">ELPL Admin</h2>
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
            <h1 className="text-3xl font-bold text-slate-900">Project Allocation</h1>
            <p className="text-slate-600 mt-1">Allocate projects to employees within your department</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Allocate New Project */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Allocate New Project</h2>
                </div>
              </div>
              <div className="p-8">
                <form onSubmit={handleAllocateProject} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
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
            </div>

            {/* Project Status Updates */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Project Status Updates</h2>
                </div>
              </div>
              <div className="p-8">
                {projectStatuses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500">No project status updates available for your department.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Employee</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Project</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Feedback</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Screenshot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projectStatuses.map((status, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4 text-slate-900">{status.employeeEmail}</td>
                            <td className="py-4 px-4 text-slate-900">{status.projectName}</td>
                            <td className="py-4 px-4 text-slate-900">{new Date(status.timestamp).toLocaleString()}</td>
                            <td className="py-4 px-4 text-slate-600">{status.feedback}</td>
                            <td className="py-4 px-4">
                              {status.screenshotURL ? (
                                <a href={status.screenshotURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  View Screenshot
                                </a>
                              ) : (
                                'N/A'
                              )}
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

export default AdminProjectAllocation;