# 🧑‍💼 Employee-HR Communication Platform

A centralized web-based system that streamlines communication between HR and employees by automating workflows such as leave requests, payslip/document sharing, daily work logs, and project tracking. Designed with simplicity, security, and seamless integration with Google services.

---

## 🌟 Key Features

### 🔐 Role-Based Access
- **Auto-login**: Employees are auto-assigned to their respective departments.
- **Scoped Visibility**: HR can only view and manage employees in their own department.

### 📂 Document Requests & Sharing
- Employees can **request payslips**, **official documents**, or **leave**.
- HR can **upload and send** requested documents through integrated **Google Drive**.

### ⏳ Time Tracking & Daily Updates
- **Timer-driven Project Sheets**: Tracks project deadlines on weekdays with real-time countdown.
- Employees must **submit daily progress updates** with optional image uploads.
- If skipped, **automated email reminders** are sent at the specified time.

### 📊 Centralized Data via Google Sheet
- Google Sheet acts as a lightweight and scalable **central database**.
- Sheets are **department-specific** and updated dynamically via Google Apps Script.

---

## 🛠️ Tech Stack

| Frontend  | Backend    | Database / Storage    | Others              |
|-----------|------------|------------------------|---------------------|
| React.js  | Node.js    | Google Sheets (via API)| Google Drive API    |
| Tailwind  | Express.js | Google Apps Script     | Email Notifications |

---

## ⚙️ System Architecture

Employee 👨‍💻 ↔️ [React Frontend] ↔️ [Node.js Backend] ↔️ Google Sheet (DB)
↕️ ↕️
Google Login Google Drive & Mail
↕️ ↕️
Auto-dept login Docs Upload, Email Reminders






---

## 📌 Modules Breakdown

### 1. **Authentication**
- Firebase authentication
- Department-based auto-login
- Two-step verification (optional)

### 2. **Leave & Document Requests**
- Submit requests via form
- HR receives alerts
- HR uploads docs to Google Drive
- Download link shared with the employee

### 3. **Daily Timeslip & Project Timer**
- Timer starts only on weekdays
- Countdown for each task deadline
- Employee uploads daily work logs (with image support)
- Missed logs trigger automated reminder emails

### 4. **Admin/HR Panel**
- View only their department’s employees
- Approve requests, upload documents
- Add/edit allocated project time
- Monitor daily timeslip submissions

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- Google Developer Console Project (OAuth + Drive + Sheets API)
- Google Sheet & Drive setup

### Installation

```bash
git clone https://github.com/yourusername/employee-hr.git
cd employee-hr
npm install
