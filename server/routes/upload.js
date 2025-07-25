// server/routes/upload.js
const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const router = express.Router();

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

// 📦 POST /api/uploadPhoto
router.post('/uploadPhoto', upload.single('photo'), async (req, res) => {
  const { email } = req.body;
  const filePath = req.file.path;

  try {
    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });
    const sheets = google.sheets({ version: 'v4', auth: client });

    // Step 1: Upload to Drive
    const driveRes = await drive.files.create({
      requestBody: {
        name: `${email}-profile.jpg`,
        mimeType: req.file.mimetype,
        parents: [process.env.DRIVE_FOLDER_ID], // Drive folder ID (shared with service account)
      },
      media: {
        mimeType: req.file.mimetype,
        body: fs.createReadStream(filePath),
      }
    });

    const fileId = driveRes.data.id;

    // Step 2: Make public
    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' }
    });

    const fileUrl = `https://drive.google.com/uc?id=${fileId}`;

    // Step 3: Update Google Sheet photoURL
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A2:G'
    });

    const rows = sheetRes.data.values;
    let rowIndex = -1;

    rows.forEach((row, index) => {
      if (row[0]?.trim().toLowerCase() === email.trim().toLowerCase()) {
        rowIndex = index + 2; // because we start from A2
      }
    });

    if (rowIndex === -1) {
      return res.status(404).json({ message: 'Employee not found in sheet' });
    }

    // Step 4: Update photo URL
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `G${rowIndex}`, // column G = photoURL
      valueInputOption: 'RAW',
      requestBody: {
        values: [[fileUrl]],
      }
    });

    res.json({ message: 'Photo uploaded and URL saved!', photoURL: fileUrl });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading photo or updating sheet' });
  } finally {
    fs.unlinkSync(filePath); // cleanup uploaded file
  }
});

module.exports = router;
