import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase-config';
import axios from 'axios';
import { 
  Building2, 
  Shield, 
  Chrome
} from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Employee'); // Default to Employee

  

  const handleLogin = () => {
    localStorage.clear(); // Clear local storage at the beginning of login attempt
    const provider = new GoogleAuthProvider();
    // No domain restriction, allow all Gmail accounts

    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const email = user.email;

        const userData = {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        };

        try {
          // Send the selected role and department to the backend for verification
          const res = await axios.post('https://employee-hr-server.onrender.com/api/login', { email, selectedRole });
          const userRole = res.data.role || 'Employee';
          const userDepartment = res.data.department;

          // Update userData with department after fetching from backend
          userData.department = userDepartment;
          localStorage.setItem('user', JSON.stringify(userData)); // Re-set user data

          localStorage.setItem('role', userRole);
          localStorage.setItem('department', userDepartment);

          if (userRole === 'Admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          alert('Login failed. You might not be a registered employee or your selected role is incorrect. Check console for details.');
          auth.signOut();
          localStorage.clear();
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        if (error.code === 'auth/popup-closed-by-user') {
          return; // Don't show an error if the user closes the popup
        } else if (error.code === 'auth/popup-blocked') {
          alert('Login failed: Popup blocked by your browser. Please allow popups for this site.');
        } else {
          alert('Login failed: ' + error.message + '. Check console for details.');
        }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">ELPL Employee Portal</h1>
            <p className="text-blue-100">Sign in to access your workspace</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Select Your Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            

            {/* Google Sign In Button */}
            <button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-4 focus:ring-blue-200 focus:outline-none flex items-center justify-center space-x-3"
            >
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <Chrome className="w-3 h-3 text-blue-600" />
              </div>
              <span>Sign In with Google</span>
            </button>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Secure authentication powered by Google
              </p>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
