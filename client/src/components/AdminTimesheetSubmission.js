import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Clock, User, Briefcase, Timer, Plus } from 'lucide-react';

function AdminTimesheetSubmission() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeEmail, setSelectedEmployeeEmail] = useState('');
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [task, setTask] = useState('');
  const [duration, setDuration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeEmail) {
      const employee = employees.find(emp => emp.email === selectedEmployeeEmail);
      if (employee && employee.department) {
        fetchProjects(employee.department);
      } else {
        setProjects([]);
      }
    }
  }, [selectedEmployeeEmail, employees]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:5050/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchProjects = async (department) => {
    try {
      const res = await axios.get(`http://localhost:5050/api/projects/department/${department}`);
      const fetchedProjects = res.data;

      const updatedProjects = fetchedProjects.map(project => {
        const startDate = new Date(project.startDate);
        const today = new Date();
        let remainingHours = project.allocatedHours;

        let currentDate = new Date(startDate);
        while (currentDate <= today) {
          const dayOfWeek = currentDate.getDay();
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            remainingHours = Math.max(0, remainingHours - 8);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return { ...project, remainingHours };
      });

      setProjects(updatedProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleTimesheetSubmission = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeEmail || !selectedProject || !task || !duration) {
      alert('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    const timesheetData = {
      employeeEmail: selectedEmployeeEmail, // This is the key change
      project: selectedProject,
      task,
      duration,
    };

    try {
      await axios.post('http://localhost:5050/api/submit-timesheet', timesheetData);
      alert('Timesheet submitted successfully for employee!');
      setSelectedEmployeeEmail('');
      setSelectedProject('');
      setTask('');
      setDuration('');
    } catch (err) {
      console.error('Error submitting timesheet:', err);
      alert('Failed to submit timesheet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="ml-72 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <Plus className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Submit Timesheet for Employee</h2>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={handleTimesheetSubmission} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Select Employee
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={selectedEmployeeEmail}
                      onChange={(e) => setSelectedEmployeeEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                    >
                      <option value="">Select an Employee</option>
                      {employees.map((employee) => (
                        <option key={employee.email} value={employee.email}>
                          {employee.name} ({employee.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Project Name
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                    >
                      <option value="">Select a Project</option>
                      {projects.map((project, index) => (
                        <option key={index} value={project.projectName}>
                          {project.projectName} (Remaining: {project.remainingHours} hrs)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Duration (Hours)
                  </label>
                  <div className="relative">
                    <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="Enter hours worked"
                      required
                      min="0"
                      step="0.5"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Task Description
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <textarea
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      placeholder="Describe the tasks worked on..."
                      required
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Timesheet
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTimesheetSubmission;