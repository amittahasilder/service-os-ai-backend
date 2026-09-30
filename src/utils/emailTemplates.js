
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const baseTemplate = ({ title, content }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
</head>

<body style="
  margin:0;
  padding:0;
  background:#0b0b12;
  font-family:Arial,sans-serif;
  color:#ffffff;
">
  <div style="
    max-width:600px;
    margin:30px auto;
    padding:30px;
    background:#151520;
    border:1px solid #29293b;
    border-radius:16px;
  ">
    <h2 style="color:#a78bfa;">
      ServiceOS
    </h2>

    <h1 style="font-size:24px;">
      ${escapeHtml(title)}
    </h1>

    <div style="
      color:#d1d1e0;
      font-size:15px;
      line-height:1.7;
    ">
      ${content}
    </div>

    <hr style="
      border:0;
      border-top:1px solid #29293b;
      margin:30px 0 20px;
    " />

    <p style="font-size:12px;color:#88889a;">
      This email was sent by ServiceOS.
      Please do not reply if this is an automated notification.
    </p>
  </div>
</body>
</html>
`;

const notificationTemplate = ({
  title,
  message,
  link,
}) => {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);

  const button = link
    ? `
      <a href="${escapeHtml(link)}"
        style="
          display:inline-block;
          margin-top:20px;
          padding:12px 22px;
          background:#7c3aed;
          color:#ffffff;
          text-decoration:none;
          border-radius:8px;
        ">
        View Details
      </a>
    `
    : "";

  return {
    subject: safeTitle,
    html: baseTemplate({
      title: safeTitle,
      content: `
        <p>${safeMessage}</p>
        ${button}
      `,
    }),
  };
};

const welcomeTemplate = ({ name }) => ({
  subject: "Welcome to ServiceOS!",
  html: baseTemplate({
    title: "Welcome to ServiceOS",
    content: `
      <p>Hello ${escapeHtml(name)},</p>
      <p>
        Your ServiceOS account is ready.
        You can now manage your service business
        from one place.
      </p>
      <p>Thank you for joining us!</p>
    `,
  }),
});

module.exports = {
  notificationTemplate,
  welcomeTemplate,
};