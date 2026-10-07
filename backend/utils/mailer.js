const sendEmail = async (to, subject, html) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Dadu-Weather", email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
};

module.exports = sendEmail;