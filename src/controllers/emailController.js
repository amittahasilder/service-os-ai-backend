
const {
  sendNotificationEmail,
} = require("../services/emailService");

const sendTestEmail = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userName = req.user?.name || "ServiceOS User";

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    const result = await sendNotificationEmail({
      to: userEmail,
      title: "ServiceOS Email Test",
      message: `Hello ${userName}, your ServiceOS email system is working successfully.`,
    });

    return res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: {
        messageId: result.messageId,
        recipient: userEmail,
      },
    });
  } catch (error) {
    console.error("Send test email error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send test email",
    });
  }
};

module.exports = {
  sendTestEmail,
};