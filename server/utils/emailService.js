const cron = require('node-cron');
const { sendEmail } = require('./mailer');
const { getAllEmployees, getTimesheetsByEmail } = require('./sheets');

async function sendReminderEmail(employeeEmail) {
  const subject = 'Timesheet Reminder: Please submit your daily timesheet';
  const text = `Dear Employee,\n\nThis is a friendly reminder to submit your timesheet for today.\n\nPlease log in to the ELPL Portal and fill out your timesheet accurately.\n\nThank you,\nELPL Team`;
  await sendEmail(employeeEmail, subject, text);
}

async function sendLeaveStatusEmail(employeeEmail, leaveDetails, status) {
  const subject = `Leave Request ${status}`;
  const text = `Dear Employee,\n\nYour leave request for ${leaveDetails.startDate} to ${leaveDetails.endDate} (Reason: ${leaveDetails.reason}) has been ${status}.\n\nThank you,\nELPL Team`;
  await sendEmail(employeeEmail, subject, text);
}

async function checkAndSendTimesheetReminders() {
  console.log('Checking for timesheet submissions...');
  const today = new Date().toLocaleDateString(); // Format: M/D/YYYY or MM/DD/YYYY

  try {
    const employees = await getAllEmployees();
    console.log(`Found ${employees.length} employees.`);

    for (const employee of employees) {
      const employeeEmail = employee.email;
      const timesheets = await getTimesheetsByEmail(employeeEmail);

      const hasSubmittedToday = timesheets.some(ts => ts.date === today && parseFloat(ts.duration) > 0);

      if (!hasSubmittedToday) {
        console.log(`Employee ${employeeEmail} has not submitted timesheet for today. Sending reminder.`);
        await sendReminderEmail(employeeEmail);
      } else {
        console.log(`Employee ${employeeEmail} has submitted timesheet for today.`);
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendTimesheetReminders:', error);
  }
}

function scheduleTimesheetReminder(time = '0 21 * * *') { // Default to 9 PM (21:00) daily
  cron.schedule(time, () => {
    console.log(`Running scheduled timesheet reminder at ${new Date().toLocaleString()}`);
    checkAndSendTimesheetReminders();
  }, {
    timezone: "Asia/Kolkata" // Set your desired timezone
  });
  console.log(`Timesheet reminder scheduled for ${time} (Asia/Kolkata timezone).`);
}

module.exports = {
  scheduleTimesheetReminder,
  checkAndSendTimesheetReminders, // Export for immediate testing if needed
  sendLeaveStatusEmail,
};