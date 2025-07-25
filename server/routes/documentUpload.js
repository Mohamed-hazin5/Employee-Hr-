const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { sendEmail } = require('../utils/mailer'); // Import sendEmail

// Multer config
const upload = multer({ dest: 'uploads/' });

// Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../credentials.json'),
  scopes: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
  ]
});

// Google Sheet ID
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// POST /api/upload-document
router.post('/upload-document', upload.single('document'), async (req, res) => {
  const { email, documentType } = req.body;
  const filePath = req.file.path;

  try {
    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Step 1: Upload to Shared Drive
    const driveRes = await drive.files.create({
      requestBody: {
        name: `${email}-${documentType}-${Date.now()}`,
        mimeType: req.file.mimetype,
        parents: [process.env.DRIVE_FOLDER_ID], // Folder in Shared Drive
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath),
      },
      supportsAllDrives: true // <-- Add this line
    });

    const fileId = driveRes.data.id;

    // Step 2: Make public
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true // <-- Add this line
    });

    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

    // Step 3: Update Google Sheet
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A2:G'
    });

    const rows = sheetRes.data.values || []; // Initialize rows as an empty array if undefined
    let rowIndex = -1;

    if (rows.length) { // Check if rows has data before iterating
      rows.forEach((row, index) => {
        if (row[0]?.trim().toLowerCase() === email.trim().toLowerCase()) {
          rowIndex = index + 2;
        }
      });
    }

    if (rowIndex === -1) {
      return res.status(404).json({ message: 'Employee not found in sheet' });
    }

    // Step 4: Update document URL
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `H${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fileUrl]],
      }
    });

    // Step 5: Send email to employee
    const subject = `Your Document is Ready: ${documentType}`;
    const text = `Dear Employee,\n\nYour requested document, \"${documentType}\", is now available.\n\nYou can view and download it here: ${fileUrl}\n\nThank you,\nELPL Team`;
    await sendEmail(email, subject, text);

    res.json({ message: 'Document uploaded, URL saved, and email sent!', documentURL: fileUrl });

  } catch (error) {
    console.error('Upload error:', error.message, error.stack);
    if (error.response) {
      console.error('Google API error response:', error.response.data);
    }
    res.status(500).json({ message: 'Error uploading document or updating sheet', error: error.message });
  } finally {
    fs.unlinkSync(filePath);
  }
});


module.exports = router;