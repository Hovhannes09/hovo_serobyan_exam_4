import HttpErrors from "http-errors";

export default {
  notFound(req, res, next) {
    next(new HttpErrors(404));
  },

  errors(err, req, res, next) {
    res.status(err.status || 500).json({
      message: err.message,
      // stack: err.stack,
      errors: err.errors ? err.errors : {},
    });
  },
};
