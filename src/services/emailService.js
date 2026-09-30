
const { transporter } = require("../config/email");

const {
  notificationTemplate,
  welcomeTemplate,
} = require("../utils/emailTemplates");

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  if (!to || !subject || !html) {
    throw new Error(
      "Recipient, subject and HTML are required"
    );
  }

  const result = await transporter.sendMail({
    from: {
      name: process.env.EMAIL_FROM_NAME || "ServiceOS",
      address: process.env.EMAIL_FROM_ADDRESS,
    },
    to,
    subject,
    html,
  });

  return {
    messageId: result.messageId,
    accepted: result.accepted,
  };
};

// Send notification email
const sendNotificationEmail = async ({
  to,
  title,
  message,
  link,
}) => {
  const template = notificationTemplate({
    title,
    message,
    link,
  });

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
};

// Send welcome email
const sendWelcomeEmail = async ({
  to,
  name,
}) => {
  const template = welcomeTemplate({ name });

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
};

module.exports = {
  sendEmail,
  sendNotificationEmail,
  sendWelcomeEmail,
};