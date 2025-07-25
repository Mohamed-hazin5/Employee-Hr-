import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Clock, 
  Calendar, 
  FileText, 
  Send, 
  Building2,
  Home,
  Plus,
  Timer,
  Briefcase,
  CheckSquare
} from 'lucide-react';

function Timesheet() {
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [task, setTask] = useState('');
  const [duration, setDuration] = useState('');
  const [user, setUser] = useState(null);
  const userDepartment = localStorage.getItem('department');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchTimesheets(userData.email);
      if (userDepartment) {
        fetchProjects(userDepartment);
      }
    }
  }, [userDepartment]);

  const fetchTimesheets = async (email) => {
    try {
      const res = await axios.post('http://localhost:5050/api/timesheets', { email });
      setTimesheets(res.data);
    } catch (err) {
      console.error('Error fetching timesheets:', err);
    }
  };

  const fetchProjects = async (department) => {
    try {
      const res = await axios.get(`http://localhost:5050/api/projects/department/${department}`);
      const fetchedProjects = res.data;

      // Calculate remaining hours based on current date and start date
      const updatedProjects = fetchedProjects.map(project => {
        const startDate = new Date(project.startDate);
        const today = new Date();
        let remainingHours = project.allocatedHours;

        let currentDate = new Date(startDate);
        while (currentDate <= today) {
          const dayOfWeek = currentDate.getDay();
          // Reduce hours only on weekdays (Monday=1 to Friday=5)
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            remainingHours = Math.max(0, remainingHours - 8);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return { ...project, remainingHours };
      });

      setProjects(updatedProjects);

      // Update remaining hours on the backend
      for (const project of updatedProjects) {
        await axios.put('http://localhost:5050/api/projects/update-hours', {
          department: project.department,
          projectName: project.projectName,
          newRemainingHours: project.remainingHours,
        });
      }

    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const handleTimesheetSubmission = async (e) => {
    e.preventDefault();
    if (!user || !selectedProject) return;

    setIsSubmitting(true);
    const timesheetData = {
      email: user.email,
      project: selectedProject,
      task,
      duration,
    };

    try {
      await axios.post('http://localhost:5050/api/submit-timesheet', timesheetData);
      alert('Timesheet submitted successfully!');
      fetchTimesheets(user.email);
      fetchProjects(user.email); // Re-fetch projects to update remaining hours
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

  const handleProjectStatusSubmission = async (e) => {
    e.preventDefault();
    if (!user || !selectedProject) return;

    setIsSubmittingStatus(true);
    let screenshotURL = '';

    if (screenshot) {
      const formData = new FormData();
      formData.append('file', screenshot);
      try {
        const uploadRes = await axios.post('http://localhost:5050/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        screenshotURL = uploadRes.data.url; // Assuming the upload endpoint returns the URL
      } catch (uploadErr) {
        console.error('Error uploading screenshot:', uploadErr);
        alert('Failed to upload screenshot.');
        setIsSubmittingStatus(false);
        return;
      }
    }

    const statusData = {
      employeeEmail: user.email,
      projectName: selectedProject,
      timestamp: new Date().toISOString(),
      screenshotURL,
      feedback,
    };

    try {
      await axios.post('http://localhost:5050/api/project-status', statusData);
      alert('Project status submitted successfully!');
      setScreenshot(null);
      setFeedback('');
    } catch (err) {
      console.error('Error submitting project status:', err);
      alert('Failed to submit project status.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/leave', label: 'Leave Management', icon: Calendar },
    { href: '/timesheet', label: 'Timesheet', icon: Clock, active: true },
    { href: '/holidays', label: 'Public Holidays', icon: Calendar },
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
            <h1 className="text-3xl font-bold text-slate-900">Timesheet</h1>
            <p className="text-slate-600 mt-1">Track your work hours and manage project time</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Submit Timesheet */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Submit Timesheet</h2>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleTimesheetSubmission} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900"
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
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Task Description
                    </label>
                    <div className="relative">
                      <CheckSquare className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                      <textarea
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        placeholder="Describe the tasks you worked on..."
                        required
                        rows={4}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 placeholder-slate-500 resize-none"
                      />
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

            {/* Project Status Update */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Project Status Update</h2>
                </div>
              </div>
              <div className="p-8">
                <form onSubmit={handleProjectStatusSubmission} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Select Project
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900"
                    >
                      <option value="">Select a Project</option>
                      {projects.map((project, index) => (
                        <option key={index} value={project.projectName}>
                          {project.projectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Screenshot (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setScreenshot(e.target.files[0])}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Feedback
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide feedback on your project progress..."
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-slate-900 placeholder-slate-500 resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingStatus}
                      className="flex items-center px-6 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmittingStatus ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Status
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Timesheet History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Timesheet History</h2>
                </div>
              </div>

              <div className="p-8">
                {timesheets.length === 0 ? (
                  <div className="text-center py-12">
                    <Timer className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Timesheet Records</h3>
                    <p className="text-slate-500">Your submitted timesheets will appear here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Date</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Project</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Task</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timesheets.map((timesheet, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-slate-900">{timesheet.date}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Briefcase className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="font-medium text-slate-900">{timesheet.project}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{timesheet.task}</td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                {timesheet.duration} hrs
                              </span>
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

export default Timesheet;