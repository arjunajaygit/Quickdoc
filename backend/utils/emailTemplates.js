// 1. For Booking Confirmation
const appointmentConfirmed = (patientName, doctorName, date, time) => {
    return {
        subject: 'Your Appointment is Confirmed - QuickDoc',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Appointment Confirmation</h2>
                <p>Hello ${patientName},</p>
                <p>This is a confirmation that your appointment with <strong>Dr. ${doctorName}</strong> has been successfully booked.</p>
                <h3>Details:</h3>
                <ul>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                </ul>
                <p>We look forward to seeing you.</p>
                <p>Sincerely,<br>The QuickDoc Team</p>
            </div>
        `
    };
};

// 2. For Reschedule Confirmation
const appointmentRescheduled = (patientName, doctorName, oldDate, oldTime, newDate, newTime) => {
    return {
        subject: 'Your Appointment has been Rescheduled - QuickDoc',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Appointment Rescheduled</h2>
                <p>Hello ${patientName},</p>
                <p>Your appointment with <strong>Dr. ${doctorName}</strong> has been rescheduled.</p>
                <h3>Previous Details:</h3>
                <ul>
                    <li><strong>Date:</strong> ${oldDate}</li>
                    <li><strong>Time:</strong> ${oldTime}</li>
                </ul>
                <h3>New Details:</h3>
                <ul>
                    <li><strong>Date:</strong> ${newDate}</li>
                    <li><strong>Time:</strong> ${newTime}</li>
                </ul>
                <p>Please note the new time. We look forward to seeing you.</p>
                <p>Sincerely,<br>The QuickDoc Team</p>
            </div>
        `
    };
};

// 3. For Cancellation Notification
const appointmentCancelled = (recipientName, doctorName, date, time) => {
    return {
        subject: 'An Appointment has been Cancelled - QuickDoc',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Appointment Cancellation Notice</h2>
                <p>Hello ${recipientName},</p>
                <p>This is to inform you that the appointment with <strong>Dr. ${doctorName}</strong> scheduled for <strong>${date} at ${time}</strong> has been cancelled.</p>
                <p>If you have any questions, please contact our support.</p>
                <p>Sincerely,<br>The QuickDoc Team</p>
            </div>
        `
    };
};

export { appointmentConfirmed, appointmentRescheduled, appointmentCancelled };