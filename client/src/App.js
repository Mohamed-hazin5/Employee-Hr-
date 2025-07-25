import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import LeaveManagement from './components/LeaveManagement';
import Timesheet from './components/Timesheet';
import PublicHolidays from './components/PublicHolidays';
import Payslips from './components/Payslips';
import DocumentRequest from './components/DocumentRequest';
import EmployeeManagement from './components/EmployeeManagement';
import AdminLeaveRequests from './components/AdminLeaveRequests';
import AdminPublicHolidays from './components/AdminPublicHolidays';
import AdminPayslips from './components/AdminPayslips';
import AdminDocumentRequests from './components/AdminDocumentRequests';
import AdminProjectAllocation from './components/AdminProjectAllocation';
import AdminTimesheetSubmission from './components/AdminTimesheetSubmission'; // You missed importing this earlier
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Employee']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leave" element={<LeaveManagement />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/holidays" element={<PublicHolidays />} />
          <Route path="/payslips" element={<Payslips />} />
          <Route path="/documents" element={<DocumentRequest />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<EmployeeManagement />} />
          <Route path="/admin/leaves" element={<AdminLeaveRequests />} />
          <Route path="/admin/holidays" element={<AdminPublicHolidays />} />
          <Route path="/admin/payslips" element={<AdminPayslips />} />
          <Route path="/admin/document-requests" element={<AdminDocumentRequests />} />
          <Route path="/admin/projects" element={<AdminProjectAllocation />} />
          <Route path="/admin/timesheet-submission" element={<AdminTimesheetSubmission />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
