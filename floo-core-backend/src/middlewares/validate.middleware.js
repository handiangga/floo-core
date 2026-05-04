module.exports = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property]);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    req[property] = value;
    next();
  };
};
