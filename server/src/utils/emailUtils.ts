/**
 * Email utility functions for hotel booking application
 * Note: This is a basic implementation. In production, you would use a service like SendGrid, Mailgun, or AWS SES
 */

import { logger } from "./logger";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface BookingConfirmationData {
  userName: string;
  userEmail: string;
  hotelName: string;
  hotelAddress: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  bookingId: string;
  bookingDate: string;
}

export interface BookingCancellationData {
  userName: string;
  userEmail: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  bookingId: string;
  cancellationDate: string;
  refundAmount: number;
}

/**
 * Generate booking confirmation email template
 */
export const generateBookingConfirmationEmail = (
  data: BookingConfirmationData
): EmailTemplate => {
  const subject = `Booking Confirmation - ${data.hotelName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Confirmed!</h1>
                <p>Thank you for choosing our hotel booking service</p>
            </div>
            
            <div class="content">
                <p>Dear ${data.userName},</p>
                <p>Your booking has been confirmed! Here are your booking details:</p>
                
                <div class="booking-details">
                    <h3>Booking Details</h3>
                    <div class="detail-row">
                        <span class="label">Booking ID:</span>
                        <span>${data.bookingId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Hotel:</span>
                        <span>${data.hotelName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Address:</span>
                        <span>${data.hotelAddress}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Room Type:</span>
                        <span>${data.roomType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-in:</span>
                        <span>${data.checkInDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-out:</span>
                        <span>${data.checkOutDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Guests:</span>
                        <span>${data.guests}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Total Price:</span>
                        <span><strong>$${data.totalPrice}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Booking Date:</span>
                        <span>${data.bookingDate}</span>
                    </div>
                </div>
                
                <p>Please save this email for your records. You may need to present this confirmation at check-in.</p>
                
                <p>If you have any questions or need to make changes to your booking, please contact us immediately.</p>
                
                <p>We look forward to welcoming you!</p>
            </div>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>&copy; 2024 Hotel Booking Service. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Booking Confirmation - ${data.hotelName}
    
    Dear ${data.userName},
    
    Your booking has been confirmed! Here are your booking details:
    
    Booking ID: ${data.bookingId}
    Hotel: ${data.hotelName}
    Address: ${data.hotelAddress}
    Room Type: ${data.roomType}
    Check-in: ${data.checkInDate}
    Check-out: ${data.checkOutDate}
    Guests: ${data.guests}
    Total Price: $${data.totalPrice}
    Booking Date: ${data.bookingDate}
    
    Please save this email for your records. You may need to present this confirmation at check-in.
    
    If you have any questions or need to make changes to your booking, please contact us immediately.
    
    We look forward to welcoming you!
    
    This is an automated email. Please do not reply to this email.
    © 2024 Hotel Booking Service. All rights reserved.
  `;

  return { subject, html, text };
};

/**
 * Generate booking cancellation email template
 */
export const generateBookingCancellationEmail = (
  data: BookingCancellationData
): EmailTemplate => {
  const subject = `Booking Cancellation - ${data.hotelName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Cancellation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .refund-info { background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Cancelled</h1>
                <p>Your booking has been successfully cancelled</p>
            </div>
            
            <div class="content">
                <p>Dear ${data.userName},</p>
                <p>We have processed your cancellation request. Here are the details:</p>
                
                <div class="booking-details">
                    <h3>Cancelled Booking Details</h3>
                    <div class="detail-row">
                        <span class="label">Booking ID:</span>
                        <span>${data.bookingId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Hotel:</span>
                        <span>${data.hotelName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Room Type:</span>
                        <span>${data.roomType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-in Date:</span>
                        <span>${data.checkInDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-out Date:</span>
                        <span>${data.checkOutDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Cancellation Date:</span>
                        <span>${data.cancellationDate}</span>
                    </div>
                </div>
                
                <div class="refund-info">
                    <h3>Refund Information</h3>
                    <p><strong>Refund Amount: $${data.refundAmount}</strong></p>
                    <p>Your refund will be processed within 5-7 business days and will appear on your original payment method.</p>
                </div>
                
                <p>We're sorry to see you cancel your booking. If you have any questions about this cancellation or need assistance with a new booking, please don't hesitate to contact us.</p>
                
                <p>Thank you for considering our service.</p>
            </div>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>&copy; 2024 Hotel Booking Service. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Booking Cancellation - ${data.hotelName}
    
    Dear ${data.userName},
    
    We have processed your cancellation request. Here are the details:
    
    Booking ID: ${data.bookingId}
    Hotel: ${data.hotelName}
    Room Type: ${data.roomType}
    Check-in Date: ${data.checkInDate}
    Check-out Date: ${data.checkOutDate}
    Cancellation Date: ${data.cancellationDate}
    
    Refund Information:
    Refund Amount: $${data.refundAmount}
    Your refund will be processed within 5-7 business days and will appear on your original payment method.
    
    We're sorry to see you cancel your booking. If you have any questions about this cancellation or need assistance with a new booking, please don't hesitate to contact us.
    
    Thank you for considering our service.
    
    This is an automated email. Please do not reply to this email.
    © 2024 Hotel Booking Service. All rights reserved.
  `;

  return { subject, html, text };
};

/**
 * Generate booking reminder email template
 */
export const generateBookingReminderEmail = (
  data: BookingConfirmationData
): EmailTemplate => {
  const subject = `Booking Reminder - Check-in Tomorrow at ${data.hotelName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Booking Reminder</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f39c12; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .label { font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .checkin-info { background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Check-in Reminder</h1>
                <p>Your stay begins tomorrow!</p>
            </div>
            
            <div class="content">
                <p>Dear ${data.userName},</p>
                <p>This is a friendly reminder that your check-in is scheduled for tomorrow. We're excited to welcome you!</p>
                
                <div class="booking-details">
                    <h3>Your Booking Details</h3>
                    <div class="detail-row">
                        <span class="label">Booking ID:</span>
                        <span>${data.bookingId}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Hotel:</span>
                        <span>${data.hotelName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Address:</span>
                        <span>${data.hotelAddress}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Room Type:</span>
                        <span>${data.roomType}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-in:</span>
                        <span><strong>${data.checkInDate}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Check-out:</span>
                        <span>${data.checkOutDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Guests:</span>
                        <span>${data.guests}</span>
                    </div>
                </div>
                
                <div class="checkin-info">
                    <h3>Check-in Information</h3>
                    <p><strong>Check-in Time:</strong> 3:00 PM onwards</p>
                    <p><strong>What to Bring:</strong> Valid ID and this booking confirmation</p>
                    <p><strong>Early Check-in:</strong> Subject to availability</p>
                </div>
                
                <p>If your plans have changed or you need to modify your booking, please contact us as soon as possible.</p>
                
                <p>We look forward to providing you with an excellent stay!</p>
            </div>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply to this email.</p>
                <p>&copy; 2024 Hotel Booking Service. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  const text = `
    Booking Reminder - Check-in Tomorrow at ${data.hotelName}
    
    Dear ${data.userName},
    
    This is a friendly reminder that your check-in is scheduled for tomorrow. We're excited to welcome you!
    
    Your Booking Details:
    Booking ID: ${data.bookingId}
    Hotel: ${data.hotelName}
    Address: ${data.hotelAddress}
    Room Type: ${data.roomType}
    Check-in: ${data.checkInDate}
    Check-out: ${data.checkOutDate}
    Guests: ${data.guests}
    
    Check-in Information:
    Check-in Time: 3:00 PM onwards
    What to Bring: Valid ID and this booking confirmation
    Early Check-in: Subject to availability
    
    If your plans have changed or you need to modify your booking, please contact us as soon as possible.
    
    We look forward to providing you with an excellent stay!
    
    This is an automated email. Please do not reply to this email.
    © 2024 Hotel Booking Service. All rights reserved.
  `;

  return { subject, html, text };
};

/**
 * Mock email sending function
 * In production, replace this with actual email service integration
 */
export const sendEmail = async (
  to: string,
  template: EmailTemplate
): Promise<boolean> => {
  try {
    // Mock email sending - in production, integrate with email service
    logger.info(`Sending email to: ${to}`);
    logger.info(`Subject: ${template.subject}`);
    logger.info(`Email content prepared and would be sent via email service`);

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return true;
  } catch (error) {
    logger.error("Error sending email:", error);
    return false;
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (
  data: BookingConfirmationData
): Promise<boolean> => {
  const template = generateBookingConfirmationEmail(data);
  return await sendEmail(data.userEmail, template);
};

/**
 * Send booking cancellation email
 */
export const sendBookingCancellationEmail = async (
  data: BookingCancellationData
): Promise<boolean> => {
  const template = generateBookingCancellationEmail(data);
  return await sendEmail(data.userEmail, template);
};

/**
 * Send booking reminder email
 */
export const sendBookingReminderEmail = async (
  data: BookingConfirmationData
): Promise<boolean> => {
  const template = generateBookingReminderEmail(data);
  return await sendEmail(data.userEmail, template);
};
