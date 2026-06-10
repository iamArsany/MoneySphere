const AppError = require("../utils/appError");

function validate(schema) {
  return (req, res, next) => {
    const target = {
      body: req.body,
      params: req.params,
      query: req.query
    };
    const { value, error } = schema.validate(target, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((item) => ({ path: item.path.join("."), message: item.message }));
      return next(new AppError(400, "VALIDATION_ERROR", "Please check the submitted data.", details));
    }
    req.body = value.body || {};
    req.params = value.params || {};
    req.query = value.query || {};
    return next();
  };
}

module.exports = validate;
