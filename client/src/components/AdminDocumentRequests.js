import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  Users,
  Calendar,
  BarChart3,
  Link,
  Mail,
  Upload
} from 'lucide-react';

function AdminDocumentRequests() {
  const [documentRequests, setDocumentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const userDepartment = localStorage.getItem('department'); // Retrieve department from localStorage

  useEffect(() => {
    fetchDocumentRequests();
  }, [userDepartment]); // Add userDepartment to dependency array

  const fetchDocumentRequests = async () => {
    setIsLoading(true);
    try {
      // Pass department as a query parameter
      const res = await axios.get(`http://localhost:5050/api/admin/document-requests?department=${userDepartment}`);
      setDocumentRequests(res.data);
    } catch (err) {
      console.error('Error fetching document requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (email, documentType) => {
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('email', email);
    formData.append('documentType', documentType);

    try {
      const res = await axios.post('http://localhost:5050/api/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(res.data.message);
      fetchDocumentRequests(); // Refresh the list
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Error uploading document.');
    }
  };

  // You might want to add functions for updating document request status here, similar to leave requests.
  // For now, I'll just display them.

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/leaves', label: 'Leave Requests', icon: Calendar },
    { href: '/admin/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/admin/payslips', label: 'Payslips', icon: FileText },
    { href: '/admin/document-requests', label: 'Document Requests', icon: FileText, active: true }, // New item
    { href: '/admin/projects', label: 'Project Allocation', icon: Building2 },
  ];

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
              <h1 className="text-3xl font-bold text-slate-900">Document Requests</h1>
              <p className="text-slate-600 mt-1">Review and manage employee document requests</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Document Requests List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">All Document Requests</h2>
                </div>
              </div>

              <div className="p-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading document requests...</p>
                  </div>
                ) : documentRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Document Requests</h3>
                    <p className="text-slate-500">No document requests found for your department.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Employee</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Document Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentRequests.map((request, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="font-medium text-slate-900">{request.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-600">{request.documentType}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(request.status)}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {request.documentURL ? (
                                <a
                                  href={request.documentURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                                >
                                  <Link className="w-4 h-4 mr-2" />
                                  View Document
                                </a>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <input type="file" onChange={handleFileChange} className="text-sm" />
                                  <button
                                    onClick={() => handleUpload(request.email, request.documentType)}
                                    disabled={!!request.documentURL} // Disable if URL exists
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
                                      !!request.documentURL ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload
                                  </button>
                                </div>
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

export default AdminDocumentRequests;
