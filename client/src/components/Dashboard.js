import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';
import axios from 'axios';
import { 
  User, 
  LogOut, 
  Upload, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Shield,
  Camera,
  FileText,
  Clock,
  Home,
  Briefcase
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

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
      alert('Access denied. You are not a registered employee.');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photo || !user?.email) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('email', user.email);

    try {
      await axios.post('http://localhost:5050/api/uploadPhoto', formData);
      alert('✅ Photo uploaded successfully!');
      fetchProfile(user.email);
      setPhoto(null);
      fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Photo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      localStorage.clear();
      navigate('/');
    }).catch((error) => {
      console.error('Logout error:', error);
      alert('Logout failed.');
    });
  };

  const profilePic = profile?.photoURL || user?.photo || 'https://via.placeholder.com/120?text=No+Photo';

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home, active: true },
    { href: '/leave', label: 'Leave Management', icon: Calendar },
    { href: '/timesheet', label: 'Timesheet', icon: Clock },
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Employee Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, manage your profile and activities</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.photo || 'https://via.placeholder.com/40?text=User'} 
                  alt="User" 
                  className="w-10 h-10 rounded-full border-2 border-slate-200"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{profile?.designation}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Profile Content */}
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12">
                <div className="flex items-center space-x-8">
                  <div className="relative">
                    <img
                      src={profilePic}
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/128?text=No+Photo'; }}
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Camera className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-2">{profile?.name || user?.name}</h2>
                    <p className="text-blue-100 text-lg">{profile?.designation}</p>
                    <p className="text-blue-200 text-sm mt-1">{profile?.department}</p>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Personal Information</h3>
                    
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Email Address</p>
                        <p className="text-slate-900">{user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Contact Number</p>
                        <p className="text-slate-900">{profile?.contact || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Joining Date</p>
                        <p className="text-slate-900">{profile?.joiningDate || 'Not available'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Work Information</h3>
                    
                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Department</p>
                        <p className="text-slate-900">{profile?.department || 'Not assigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Role</p>
                        <p className="text-slate-900">{profile?.role || 'Employee'}</p>
                      </div>
                    </div>

                    {/* Photo Upload Form */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Update Profile Photo</h4>
                      <form onSubmit={handlePhotoUpload} className="space-y-4">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPhoto(e.target.files[0])}
                            ref={fileInputRef}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!photo || isUploading}
                          className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Photo
                            </>
                          )}
                        </button>
                      </form>
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

export default Dashboard;