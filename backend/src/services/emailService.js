async function sendEmail({ to, subject, text }) {
  // TODO: Wire SMTP provider from SRS 6.4. The API behavior must not depend on a guessed vendor.
  return { to, subject, text, queued: true };
}

module.exports = { sendEmail };
