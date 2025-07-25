import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Download, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle,
  Building2,
  Home,
  Calendar,
  Plus,
  AlertCircle
} from 'lucide-react';

function DocumentRequest() {
  const [requests, setRequests] = useState([]);
  const [documentType, setDocumentType] = useState('Bonafide');
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchRequests(userData.email);
    }
  }, []);

  const fetchRequests = async (email) => {
    try {
      const res = await axios.post('http://localhost:5050/api/document-requests', { email });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching document requests:', err);
    }
  };

  const handleRequestSubmission = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const requestData = {
      email: user.email,
      documentType,
      department: user.department, // Add department here
    };

    try {
      await axios.post('http://localhost:5050/api/submit-document-request', requestData);
      alert('Document request submitted successfully!');
      fetchRequests(user.email);
      setDocumentType('Bonafide');
    } catch (err) {
      console.error('Error submitting document request:', err);
      alert('Failed to submit document request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/leave', label: 'Leave Management', icon: Calendar },
    { href: '/timesheet', label: 'Timesheet', icon: Clock },
    { href: '/holidays', label: 'Public Holidays', icon: Calendar },
    { href: '/payslips', label: 'Payslips', icon: FileText },
    { href: '/documents', label: 'Document Request', icon: FileText, active: true },
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
            <h1 className="text-3xl font-bold text-slate-900">Document Request</h1>
            <p className="text-slate-600 mt-1">Request official documents and track their status</p>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Request Document */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <Plus className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Request a Document</h2>
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleRequestSubmission} className="space-y-6">
                  <div className="max-w-md">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Document Type
                    </label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                    >
                      <option value="Bonafide">Bonafide Certificate</option>
                      <option value="IT Filing Proof">IT Filing Proof</option>
                      <option value="Salary Certificate">Salary Certificate</option>
                    </select>
                  </div>

                  <div className="flex justify-start">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Document Requests History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Your Document Requests</h2>
                </div>
              </div>

              <div className="p-8">
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Document Requests</h3>
                    <p className="text-slate-500">You haven't requested any documents yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Document Type</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Status</th>
                          <th className="text-left py-4 px-4 font-semibold text-slate-700">Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request, index) => (
                          <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200">
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-indigo-600" />
                                </div>
                                <span className="font-medium text-slate-900">{request.documentType}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(request.status)}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {request.url ? (
                                <a
                                  href={request.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </a>
                              ) : (
                                <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-400 bg-slate-50 rounded-lg">
                                  Not Available
                                </span>
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

export default DocumentRequest;