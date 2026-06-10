function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json(data);
}

function errorPayload(code, message, details) {
  return { error: { code, message, details: details || null } };
}

module.exports = { ok, errorPayload };
