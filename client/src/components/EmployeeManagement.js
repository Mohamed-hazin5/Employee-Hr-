import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Calendar,
  Shield,
  Search,
  UserPlus,
  AlertTriangle,
  FileText,
  Edit
} from 'lucide-react';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [newEmployee, setNewEmployee] = useState({ 
    email: '', 
    name: '', 
    designation: '', 
    department: '', 
    contact: '', 
    joiningDate: '', 
    role: 'Employee' 
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userDepartment = localStorage.getItem('department');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`http://localhost:5050/api/employees?department=${userDepartment}`);
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee({ ...editingEmployee, [name]: value });
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post('http://localhost:5050/api/employees', { ...newEmployee, department: userDepartment });
      alert('Employee added successfully!');
      fetchEmployees();
      setNewEmployee({ 
        email: '', 
        name: '', 
        designation: '', 
        department: '', 
        contact: '', 
        joiningDate: '', 
        role: 'Employee' 
      });
    } catch (err) {
      console.error('Error adding employee:', err);
      alert('Failed to add employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5050/api/employees/${editingEmployee.email}`, editingEmployee);
      alert('Employee updated successfully!');
      fetchEmployees();
      setEditingEmployee(null);
    } catch (err) {
      console.error('Error updating employee:', err);
      alert('Failed to update employee.');
    }
  };

  const handleDeleteEmployee = async (email) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`http://localhost:5050/api/employees/${email}`);
        alert('Employee deleted successfully!');
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        alert('Failed to delete employee.');
      }
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: Building2 },
    { href: '/admin/employees', label: 'Employees', icon: Users, active: true },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/admin/payslips', label: 'Payslips', icon: FileText },
    { href: '/admin/document-requests', label: 'Document Requests', icon: FileText },
    { href: '/admin/projects', label: 'Project Allocation', icon: Building2 },
   
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
            <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
            <p className="text-slate-600 mt-1">Manage employee records and information for the {userDepartment} department</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Add New Employee */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <UserPlus className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Add New Employee</h2>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleAddEmployee} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={newEmployee.email}
                          onChange={handleInputChange}
                          placeholder="employee@company.com"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="name"
                          value={newEmployee.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={newEmployee.designation}
                        onChange={handleInputChange}
                        placeholder="Software Engineer"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 placeholder-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Contact Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          name="contact"
                          value={newEmployee.contact}
                          onChange={handleInputChange}
                          placeholder="+1 (555) 123-4567"
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Joining Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="date"
                          name="joiningDate"
                          value={newEmployee.joiningDate}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select
                          name="role"
                          value={newEmployee.role}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900"
                        >
                          <option value="Employee">Employee</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Adding Employee...
                        </> 
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Employee
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* All Employees */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold text-white">All Employees</h2>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8">
                {filteredEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Employees Found</h3>
                    <p className="text-slate-500">
                      {searchTerm ? 'No employees match your search criteria.' : 'No employees have been added yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Employee</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Designation</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Department</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Role</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.email} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{employee.name}</p>
                                  <p className="text-sm text-slate-500">{employee.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-900">{employee.designation}</td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {employee.department}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                employee.role === 'Admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {employee.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 flex space-x-2">
                              <button
                                onClick={() => setEditingEmployee(employee)}
                                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee.email)}
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

      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Edit Employee</h2>
            </div>
            <div className="p-8">
              <form onSubmit={handleUpdateEmployee} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editingEmployee.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editingEmployee.name}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={editingEmployee.designation}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Contact Number</label>
                    <input
                      type="text"
                      name="contact"
                      value={editingEmployee.contact}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={editingEmployee.joiningDate}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">Role</label>
                    <select
                      name="role"
                      value={editingEmployee.role}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Employee">Employee</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-6 py-3 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors duration-200"
                  >
                    Update Employee
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeManagement;
