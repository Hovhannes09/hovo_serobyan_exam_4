import _ from "lodash";
import HttpErrors from "http-errors";

const validator =
  (schema, path = "body") =>
  (req, res, next) => {
    try {
      const v = schema.validate(req[path] || {}, { abortEarly: false });

      if (v.error) {
        const errors = {};

        v.error.details.forEach((d) => {
          const errorMessage = d.message.replace(/".*"/, "").trim();
          _.set(errors, d.path, errorMessage);
        });

        throw new HttpErrors(422, {
          message: "Validation error",
          errors,
        });
      }

      next();
    } catch (e) {
      console.error(e);
      next(e);
    }
  };

export default validator;
