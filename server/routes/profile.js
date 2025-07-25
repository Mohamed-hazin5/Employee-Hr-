const express = require('express');
const { getSheetData, getDepartments, getEmployeeDepartmentByEmail } = require('../utils/sheets');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, selectedRole, selectedDepartment } = req.body;

  console.log('Received profile request:', { email, selectedRole, selectedDepartment });

  if (!email || !selectedRole || !selectedDepartment) {
    console.log('Missing required fields for profile request.');
    return res.status(400).send('Email, role, and department are required.');
  }

  try {
    const sheetData = await getSheetData(selectedDepartment);
    console.log('Sheet data for department ', selectedDepartment, ':', sheetData);

    if (!sheetData || sheetData.length === 0) {
      console.log('No sheet data found for department:', selectedDepartment);
      return res.status(404).send('Department sheet not found or is empty.');
    }

    const headers = sheetData[0];
    const emailIndex = headers.indexOf('Email');
    const roleIndex = headers.indexOf('Role');

    if (emailIndex === -1 || roleIndex === -1) {
      console.log('Missing Email or Role header in sheet for department:', selectedDepartment);
      return res.status(400).send('Sheet must contain Email and Role headers.');
    }

    const userRow = sheetData.slice(1).find(row => row[emailIndex] === email);
    console.log('User row found:', userRow);

    if (userRow) {
      if (userRow[roleIndex].toLowerCase() !== selectedRole.toLowerCase()) {
        console.log('User role mismatch. Expected:', selectedRole, 'Found:', userRow[roleIndex]);
        return res.status(403).send('User role does not match.');
      }
      const userProfile = headers.reduce((profile, header, index) => {
        profile[header.toLowerCase().replace(/\s+/g, '')] = userRow[index];
        return profile;
      }, {});
      console.log('Profile data sent:', userProfile);
      res.json(userProfile);
    } else {
      console.log('User not found in sheet for email:', email, 'and department:', selectedDepartment);
      res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).send('Server error');
  }
});

router.post('/update', async (req, res) => {
  const { email, selectedRole, ...updatedData } = req.body;

  if (!email || !selectedRole) {
    return res.status(400).send('Email and role are required.');
  }

  try {
    const sheetData = await getSheetData(selectedRole);
    const headers = sheetData[0];
    const emailIndex = headers.indexOf('Email');
    const userRowIndex = sheetData.slice(1).findIndex(row => row[emailIndex] === email);

    if (userRowIndex !== -1) {
        const rowIndex = userRowIndex + 2; // +1 for header, +1 for 1-based indexing
        const { getSheet } = require('../utils/sheets');
        const sheet = await getSheet(selectedRole);
        
        const cells = await sheet.loadCells();

        for (const key in updatedData) {
            const headerIndex = headers.indexOf(key);
            if (headerIndex !== -1) {
                const cell = sheet.getCell(rowIndex -1, headerIndex);
                cell.value = updatedData[key];
            }
        }
        await sheet.saveUpdatedCells(cells);
        
        res.status(200).send('Profile updated successfully.');
    } else {
        res.status(404).send('User not found.');
    }
  } catch (error) {
    console.error('Error updating profile data:', error);
    res.status(500).send('Server error');
  }
});

router.get('/departments', async (req, res) => {
  try {
    const departments = await getDepartments();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).send('Server error');
  }
});

router.get('/stats', async (req, res) => {
    const { department } = req.query;

    if (!department) {
        return res.status(400).send('Department is required.');
    }

    try {
        const employees = await getSheetData('Sheet1');
        const leaves = await getSheetData('Leave');
        const documents = await getSheetData('DocumentRequests');

        const departmentEmployees = employees.filter(row => row[3] === department).length;
        const pendingLeaves = leaves.filter(row => row[6] === department && row[5] === 'Pending').length;
        const pendingDocuments = documents.filter(row => row[4] === department && row[2] === 'Pending').length;

        res.json({
            totalEmployees: departmentEmployees,
            pendingLeaves,
            documentRequests: pendingDocuments,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
