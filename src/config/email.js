
const nodemailer = require("nodemailer");

const requiredEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM_ADDRESS",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing email environment variable: ${key}`);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const verifyEmailConnection = async () => {
  await transporter.verify();
  console.log("Email SMTP connection verified");
};

module.exports = {
  transporter,
  verifyEmailConnection,
};