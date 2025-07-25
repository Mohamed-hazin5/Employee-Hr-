// server/utils/sheets.js
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// ✅ Corrected: Load .env here too for safety
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

async function getSheet(sheetName){
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) {
    return null;
  }
  return sheet;
}

async function getEmployeeByEmail(email) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:K',
  });

  const rows = res.data.values || [];
  console.log(`🔍 Raw data from sheet:`, rows);
  console.log(`🔍 Rows fetched: ${rows.length}`);

  if (rows.length) {
    for (let row of rows) {
      const sheetEmail = row[0]?.trim().toLowerCase();
      const inputEmail = email?.trim().toLowerCase();
      console.log(`🔍 Comparing: ${sheetEmail} === ${inputEmail}`);

      if (sheetEmail === inputEmail) {
        console.log('✅ Match found:', row);
        const photoURL = row[6] || null;
        const transformedURL = photoURL ? transformGoogleDriveURL(photoURL) : null;

        return {
          email: row[0],
          name: row[1],
          designation: row[2],
          department: row[3],
          contact: row[4],
          joiningDate: row[5],
          photoURL: transformedURL,
          role: row[7]?.trim().toLowerCase() === 'admin' ? 'Admin' : 'Employee',
          projectName: row[8],
          allocatedHours: row[9],
          startDate: row[10],
        };

      }
    }
  }

  return null;
}

async function getAllEmployees(departmentFilter = null) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A1:K',
  });

  const rows = res.data.values;
  if (!rows) return [];

  // Skip the header row if it exists
  const dataRows = rows.slice(1);

  return dataRows
    .filter(row => !departmentFilter || (row[3] && row[3].trim().toLowerCase() === departmentFilter.toLowerCase()))
    .map(row => ({
      email: row[0],
      name: row[1],
      designation: row[2],
      department: row[3],
      contact: row[4],
      joiningDate: row[5],
      photoURL: row[6] ? transformGoogleDriveURL(row[6]) : null,
      role: row[7],
      projectName: row[8],
      allocatedHours: row[9],
      startDate: row[10],
    }));
}

async function addEmployee(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[data.email, data.name, data.designation, data.department, data.contact, data.joiningDate, '', data.role]],
      },
    });
  } catch (error) {
    console.error('Error adding employee to sheet:', error.message, error.stack);
    throw error;
  }
}

async function allocateProject(data) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    // Find the employee's row in Sheet1
    const employeeRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:A', // Only get the email column to find the row index
    });

    const rows = employeeRows.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim()?.toLowerCase() === data.employeeEmail?.trim()?.toLowerCase());

    if (rowIndex === -1) {
      throw new Error('Employee not found for project allocation.');
    }

    // Update the employee's row with project details (assuming columns I, J, K)
    // rowIndex + 1 because sheets are 1-indexed and header is row 1
    const updateRange = `Sheet1!I${rowIndex + 1}:K${rowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[data.projectName, data.allocatedHours, data.startDate]],
      },
    });
  } catch (error) {
    console.error('Error allocating project to sheet:', error.message, error.stack);
    throw error;
  }
}

async function deleteEmployee(email) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:H',
  });

  const rows = res.data.values;
  if (!rows) return;

  const rowIndex = rows.findIndex(row => row[0] === email);
  if (rowIndex === -1) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming the first sheet
              dimension: 'ROWS',
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });
}

async function getLeavesByEmail(email) {
  const sheet = await getSheet('Leave');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Leave!A2:F',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows.filter(row => row[0] === email).map(row => ({
    email: row[0],
    leaveType: row[1],
    startDate: row[2],
    endDate: row[3],
    reason: row[4],
    status: row[5],
  }));
}

async function applyForLeave(data) {
  const sheet = await getSheet('Leave');
  if (!sheet) throw new Error('Leave sheet not found');

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // Server-side validation for casual leave limit
  if (data.leaveType === 'Casual') {
    const existingLeaves = await getLeavesByEmail(data.email);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const casualLeaveThisMonth = existingLeaves.some(leave => {
      const leaveDate = new Date(leave.startDate);
      return leave.leaveType === 'Casual' && 
             leaveDate.getMonth() === currentMonth && 
             leaveDate.getFullYear() === currentYear &&
             (leave.status === 'Approved' || leave.status === 'Pending');
    });

    if (casualLeaveThisMonth) {
      throw new Error('You have already applied for casual leave this month.');
    }
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Leave!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[data.email, data.leaveType, data.startDate, data.endDate, data.reason, 'Pending', await getEmployeeDepartmentByEmail(data.email)]], // Add department
      },
    });
  } catch (error) {
    console.error('Error applying for leave to sheet:', error.message, error.stack);
    throw error;
  }
}

async function getEmployeeDepartmentByEmail(email) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A2:D', // Assuming Email is A and Department is D
  });

  const rows = res.data.values || [];
  if (rows.length) {
    for (let row of rows) {
      const sheetEmail = row[0]?.trim().toLowerCase();
      const inputEmail = email?.trim().toLowerCase();
      if (sheetEmail === inputEmail) {
        return row[3]?.trim(); // Department is at index 3
      }
    }
  }
  return null;
}

async function getAllLeaveRequests(departmentFilter = null) {
  const sheet = await getSheet('Leave');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Leave!A2:F',
  });

  const rows = res.data.values;
  if (!rows) return [];

  let filteredRequests = [];
  for (const row of rows) {
    const employeeEmail = row[0];
    const employeeDepartment = await getEmployeeDepartmentByEmail(employeeEmail);
    if (!departmentFilter || (employeeDepartment && employeeDepartment.toLowerCase() === departmentFilter.toLowerCase())) {
      filteredRequests.push({
        email: row[0],
        leaveType: row[1],
        startDate: row[2],
        endDate: row[3],
        reason: row[4],
        status: row[5],
      });
    }
  }
  return filteredRequests;
}

const { sendEmail } = require('./mailer');

async function updateLeaveStatus(email, startDate, status) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Leave!A2:F',
  });

  const rows = res.data.values;
  if (!rows) return;

  const rowIndex = rows.findIndex(row => row[0] === email && row[2] === startDate);
  if (rowIndex === -1) return;

  const leaveDetails = {
    email: rows[rowIndex][0],
    leaveType: rows[rowIndex][1],
    startDate: rows[rowIndex][2],
    endDate: rows[rowIndex][3],
    reason: rows[rowIndex][4],
    status: status, // Use the new status
  };

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Leave!F${rowIndex + 2}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[status]],
    },
  });
  const subject = `Leave Request ${status}`;
  const text = `Dear Employee,\n\nYour leave request for ${leaveDetails.startDate} to ${leaveDetails.endDate} (Reason: ${leaveDetails.reason}) has been ${status}.\n\nThank you,\nELPL Team`;
  await sendEmail(email, subject, text);
}

async function getTimesheetsByEmail(email) {
  const sheet = await getSheet('Timesheet');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Timesheet!A2:E',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows.filter(row => row[0] === email).map(row => ({
    email: row[0],
    date: row[1],
    project: row[2],
    task: row[3],
    duration: row[4],
  }));
}

async function submitTimesheet(data) {
  const sheet = await getSheet('Timesheet');
  if (!sheet) throw new Error('Timesheet sheet not found');

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const targetEmail = data.employeeEmail || data.email; // Use employeeEmail if provided, otherwise use the submitting user's email

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Timesheet!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[targetEmail, new Date().toLocaleDateString(), data.project, data.task, data.duration, await getEmployeeDepartmentByEmail(targetEmail)]], // Add department
      },
    });
  } catch (error) {
    console.error('Error submitting timesheet to sheet:', error.message, error.stack);
    throw error;
  }
}

async function getHolidays() {
  const sheet = await getSheet('Holidays');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Holidays!A2:B',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows.map(row => ({
    date: row[0],
    name: row[1],
  }));
}

async function addHoliday(data) {
  const sheet = await getSheet('Holidays');
  if (!sheet) throw new Error('Holidays sheet not found');

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Holidays!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[data.date, data.name]],
      },
    });
  } catch (error) {
    console.error('Error adding holiday to sheet:', error.message, error.stack);
    throw error;
  }
}

async function deleteHoliday(date) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Holidays!A2:B',
  });

  const rows = res.data.values;
  if (!rows) return;

  const rowIndex = rows.findIndex(row => row[0] === date);
  if (rowIndex === -1) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    resource: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // Assuming the first sheet
              dimension: 'ROWS',
              startIndex: rowIndex + 1,
              endIndex: rowIndex + 2,
            },
          },
        },
      ],
    },
  });
}

async function getPayslipsByEmail(email) {
  const sheet = await getSheet('Payslips');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Payslips!A2:D',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows.filter(row => row[0] === email).map(row => ({
    email: row[0],
    month: row[1],
    year: row[2],
    url: row[3],
  }));
}

async function getAllPayslips(departmentFilter = null) {
  const sheet = await getSheet('Payslips');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Payslips!A2:D',
  });

  const rows = res.data.values;
  if (!rows) return [];

  let filteredPayslips = [];
  for (const row of rows) {
    const employeeEmail = row[0];
    const employeeDepartment = await getEmployeeDepartmentByEmail(employeeEmail);
    if (!departmentFilter || (employeeDepartment && employeeDepartment.toLowerCase() === departmentFilter.toLowerCase())) {
      filteredPayslips.push({
        email: row[0],
        month: row[1],
        year: row[2],
        url: row[3],
      });
    }
  }
  return filteredPayslips;
}

async function addPayslip(data) {
  const sheet = await getSheet('Payslips');
  if (!sheet) throw new Error('Payslips sheet not found');

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Payslips!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[data.email, data.month, data.year, data.url, await getEmployeeDepartmentByEmail(data.email)]], // Add department
      },
    });
  } catch (error) {
    console.error('Error adding payslip to sheet:', error.message, error.stack);
    throw error;
  }
}

async function getDocumentRequestsByEmail(email) {
  const sheet = await getSheet('DocumentRequests');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'DocumentRequests!A2:D',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows.filter(row => row[0] === email).map(row => ({
    email: row[0],
    documentType: row[1],
    status: row[2],
    url: row[3],
  }));
}

async function getAllDocumentRequests(departmentFilter = null) {
  const sheet = await getSheet('DocumentRequests');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'DocumentRequests!A2:E',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows
    .filter(row => !departmentFilter || row[4] === departmentFilter)
    .map(row => ({
      email: row[0],
      documentType: row[1],
      status: row[2],
      url: row[3],
      department: row[4],
    }));
}

function transformGoogleDriveURL(url) {
  if (!url || !url.includes('drive.google.com')) {
    return url; // Return original if not a Google Drive URL
  }

  const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }

  return url; // Return original if no match found
}

async function getDepartments() {
  const sheet = await getSheet('Departments');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Departments!A2:A',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows.map(row => row[0]);
}

async function getSheetData(sheetName) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:ZZ`, // Fetch all data from the specified sheet
  });

  return res.data.values || [];
}

async function submitDocumentRequest(data) {
  const sheet = await getSheet('DocumentRequests');
  if (!sheet) throw new Error('DocumentRequests sheet not found');

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    console.log('Submitting document request with data:', data);
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'DocumentRequests!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[data.email, data.documentType, 'Processing', null, data.department]], // Assuming status and URL, and adding department
      },
    });
    console.log('Document request successfully appended to sheet:', response.data);
  } catch (error) {
    console.error('Error submitting document request to sheet:', error.message, error.stack);
    throw error;
  }
}

async function updateDocumentRequestStatus(email, documentType, status) {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'DocumentRequests!A2:E',
    });

    const rows = res.data.values;
    if (!rows) return;

    const rowIndex = rows.findIndex(row => row[0] === email && row[1] === documentType);
    if (rowIndex === -1) return;

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `DocumentRequests!C${rowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [[status]],
        },
    });
}

async function updateEmployee(email, data) {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: 'Sheet1!A2:H',
    });

    const rows = res.data.values;
    if (!rows) return;

    const rowIndex = rows.findIndex(row => row[0] === email);
    if (rowIndex === -1) return;

    const row = rows[rowIndex];
    const updatedRow = [
        data.email || row[0],
        data.name || row[1],
        data.designation || row[2],
        data.department || row[3],
        data.contact || row[4],
        data.joiningDate || row[5],
        row[6], // Keep photoURL the same
        data.role || row[7],
    ];

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!A${rowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [updatedRow],
        },
    });
}

async function addProjectStatus(data) {
  const sheet = await getSheet('ProjectStatus');
  if (!sheet) throw new Error('ProjectStatus sheet not found');

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'ProjectStatus!A1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[data.employeeEmail, data.projectName, data.timestamp, data.screenshotURL, data.feedback]],
      },
    });
  } catch (error) {
    console.error('Error adding project status to sheet:', error.message, error.stack);
    throw error;
  }
}

async function getProjectStatusByEmployeeEmail(employeeEmail) {
  const sheet = await getSheet('ProjectStatus');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'ProjectStatus!A2:E',
  });

  const rows = res.data.values;
  if (!rows) return [];

  return rows.filter(row => row[0] === employeeEmail).map(row => ({
    employeeEmail: row[0],
    projectName: row[1],
    timestamp: row[2],
    screenshotURL: row[3],
    feedback: row[4],
  }));
}

async function getAllProjectStatus(departmentFilter = null) {
  const sheet = await getSheet('ProjectStatus');
  if (!sheet) return [];

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'ProjectStatus!A2:E',
  });

  const rows = res.data.values;
  if (!rows) return [];

  const filteredRows = [];
  for (const row of rows) {
    const employeeDepartment = await getEmployeeDepartmentByEmail(row[0]); // Assuming employee email is in row[0]
    if (!departmentFilter || (employeeDepartment && employeeDepartment.toLowerCase() === departmentFilter.toLowerCase())) {
      filteredRows.push({
        employeeEmail: row[0],
        projectName: row[1],
        timestamp: row[2],
        screenshotURL: row[3],
        feedback: row[4],
      });
    }
  }
  return filteredRows;
}

module.exports = {
  getSheet,
  getEmployeeByEmail,
  getAllEmployees,
  addEmployee,
  allocateProject,
  deleteEmployee,
  getLeavesByEmail,
  applyForLeave,
  getEmployeeDepartmentByEmail,
  getAllLeaveRequests,
  updateLeaveStatus,
  getTimesheetsByEmail,
  submitTimesheet,
  getHolidays,
  addHoliday,
  deleteHoliday,
  getPayslipsByEmail,
  getAllPayslips,
  addPayslip,
  getDocumentRequestsByEmail,
  getAllDocumentRequests,
  transformGoogleDriveURL,
  getDepartments,
  getSheetData,
  submitDocumentRequest,
  updateDocumentRequestStatus,
  updateEmployee,
  addProjectStatus,
  getProjectStatusByEmployeeEmail,
  getAllProjectStatus
};