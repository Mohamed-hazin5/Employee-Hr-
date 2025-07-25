// server/index.js
require('dotenv').config(); // Load .env first

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { 
  getEmployeeByEmail, getLeavesByEmail, applyForLeave, getTimesheetsByEmail, submitTimesheet, getHolidays, 
  getPayslipsByEmail, getDocumentRequestsByEmail, submitDocumentRequest, getAllEmployees, addEmployee, 
  deleteEmployee, getAllLeaveRequests, updateLeaveStatus, addHoliday, deleteHoliday, getAllPayslips, 
  addPayslip, getAllDocumentRequests, updateDocumentRequestStatus , getAllProjectStatus , allocateProject// <-- add this
} = require('./utils/sheets');
const { scheduleTimesheetReminder } = require('./utils/emailService');



const app = express(); // ✅ Define before using
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "www.google.com", "www.gstatic.com"],
    frameSrc: ["'self'", "www.google.com"],
    imgSrc: ["'self'", "data:", "www.gstatic.com", "drive.google.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "www.gstatic.com"],
    fontSrc: ["'self'", "data:", "www.gstatic.com"],
  },
}));

// Temporarily relax Cross-Origin-Opener-Policy for local development with Google Sign-In popups.
// This should be reviewed for production environments.
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use(cors({ origin: 'http://localhost:3001' }));
app.use(express.json());



// 📦 Photo Upload Route
const uploadRoute = require('./routes/upload'); // Upload to Google Drive
app.use('/api', uploadRoute);

const documentUploadRoute = require('./routes/documentUpload');
app.use('/api', documentUploadRoute);

// ✅ Profile Fetch from Google Sheet
app.post('/api/login', async (req, res) => {
  const { email, selectedRole } = req.body;
  console.log(`Received login request for email: ${email}, selected role: ${selectedRole}`);
  try {
    const employee = await getEmployeeByEmail(email);
    if (employee) {
  console.log(`Employee found: ${employee.email}, role from sheet: ${employee.role}`);
  // Make role comparison case-insensitive
  if (employee.role.toLowerCase() === selectedRole.toLowerCase()) {
    res.json(employee);
  } else {
    res.status(403).json({ message: 'Unauthorized: Role mismatch' });
  }
} else {
  res.status(404).json({ message: 'Employee not found' });
}
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/profile', async (req, res) => {
  const { email, selectedRole } = req.body;
  try {
    const employee = await getEmployeeByEmail(email);
    if (employee) {
      // If selectedRole is provided, check it
      if (selectedRole && employee.role.toLowerCase() !== selectedRole.toLowerCase()) {
        return res.status(403).json({ message: 'Unauthorized: Role mismatch' });
      }
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/leaves', async (req, res) => {
  const { email } = req.body;
  try {
    const leaves = await getLeavesByEmail(email);
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/apply-leave', async (req, res) => {
  try {
    await applyForLeave(req.body);
    res.status(200).json({ message: 'Leave applied successfully' });
  } catch (error) {
    console.error('Error applying for leave:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/timesheets', async (req, res) => {
  const { email } = req.body;
  try {
    const timesheets = await getTimesheetsByEmail(email);
    res.json(timesheets);
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/submit-timesheet', async (req, res) => {
  try {
    await submitTimesheet(req.body);
    res.status(200).json({ message: 'Timesheet submitted successfully' });
  } catch (error) {
    console.error('Error submitting timesheet:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/holidays', async (req, res) => {
  try {
    const holidays = await getHolidays();
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/payslips', async (req, res) => {
  const { email } = req.body;
  try {
    const payslips = await getPayslipsByEmail(email);
    res.json(payslips);
  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/document-requests', async (req, res) => {
  const { email } = req.body;
  try {
    const requests = await getDocumentRequestsByEmail(email);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching document requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/submit-document-request', async (req, res) => {
  try {
    await submitDocumentRequest(req.body);
    res.status(200).json({ message: 'Document request submitted successfully' });
  } catch (error) {
    console.error('Error submitting document request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/employees', async (req, res) => {
  const { department } = req.query; // Get department from query parameter
  try {
    const employees = await getAllEmployees(department); // Pass department
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    await addEmployee(req.body);
    res.status(200).json({ message: 'Employee added successfully' });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    await allocateProject(req.body);
    res.status(200).json({ message: 'Project allocated successfully' });
  } catch (error) {
    console.error('Error allocating project:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/employees/:email', async (req, res) => {
  try {
    await deleteEmployee(req.params.email);
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/leave-requests', async (req, res) => {
  const { department } = req.query; // Get department from query parameter
  try {
    const leaveRequests = await getAllLeaveRequests(department); // Pass department
    res.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching all leave requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/update-leave-status', async (req, res) => {
  const { email, startDate, status } = req.body;
  try {
    await updateLeaveStatus(email, startDate, status);
    res.status(200).json({ message: 'Leave status updated successfully' });
  } catch (error) {
    console.error('Error updating leave status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/holidays', async (req, res) => {
  try {
    await addHoliday(req.body);
    res.status(200).json({ message: 'Holiday added successfully' });
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/holidays/:date', async (req, res) => {
  try {
    await deleteHoliday(req.params.date);
    res.status(200).json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/payslips', async (req, res) => {
  const { department } = req.query; // Get department from query parameter
  try {
    const payslips = await getAllPayslips(department); // Pass department
    res.json(payslips);
  } catch (error) {
    console.error('Error fetching all payslips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/payslips', async (req, res) => {
  try {
    await addPayslip(req.body);
    res.status(200).json({ message: 'Payslip added successfully' });
  } catch (error) {
    console.error('Error adding payslip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects', async (req, res) => {
  const { department } = req.query;
  try {
    const projects = await getAllProjects(department);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/projects/department/:department', async (req, res) => {
  try {
    const projects = await getProjectsByDepartment(req.params.department);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching department projects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/projects/update-hours', async (req, res) => {
  const { department, projectName, newRemainingHours } = req.body;
  try {
    await updateProjectRemainingHours(department, projectName, newRemainingHours);
    res.status(200).json({ message: 'Project hours updated successfully' });
  } catch (error) {
    console.error('Error updating project hours:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/project-status', async (req, res) => {
  try {
    await addProjectStatus(req.body);
    res.status(200).json({ message: 'Project status submitted successfully' });
  } catch (error) {
    console.error('Error submitting project status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/project-status/:email', async (req, res) => {
  try {
    const projectStatus = await getProjectStatusByEmployeeEmail(req.params.email);
    res.json(projectStatus);
  } catch (error) {
    console.error('Error fetching project status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/project-status', async (req, res) => {
  const { department } = req.query;
  try {
    const projectStatus = await getAllProjectStatus(department);
    res.json(projectStatus);
  } catch (error) {
    console.error('Error fetching all project status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/document-requests', async (req, res) => {
  const { department } = req.query; // Get department from query parameter
  try {
    const documentRequests = await getAllDocumentRequests(department); // Pass department
    res.json(documentRequests);
  } catch (error) {
    console.error('Error fetching all document requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/update-document-status', async (req, res) => {
  const { email, documentType, status } = req.body;
  try {
    await updateDocumentRequestStatus(email, documentType, status);
    res.status(200).json({ message: 'Document request status updated successfully' });
  } catch (error) {
    console.error('Error updating document request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// ✅ Start server
app.listen(5050, () => {
  console.log('✅ Server running on http://localhost:5050');
  scheduleTimesheetReminder(); // Schedule the timesheet reminder
});