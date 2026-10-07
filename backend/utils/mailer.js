const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    return false; // email set up nahi hai
  }

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
      textContent: text,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  return true;
};

module.exports = sendEmail;
module.exports.sendMail = sendEmail;