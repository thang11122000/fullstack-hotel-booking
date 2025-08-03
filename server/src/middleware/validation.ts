import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { ResponseHelper } from "../utils/response";

export const validate = (
  schema: Joi.ObjectSchema,
  source: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source];
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      }));

      return ResponseHelper.validationError(res, errors);
    }

    // Replace the original data with validated and sanitized data
    req[source] = value;
    return next();
  };
};

// Specific validation middlewares
export const validateBody = (schema: Joi.ObjectSchema) =>
  validate(schema, "body");
export const validateQuery = (schema: Joi.ObjectSchema) =>
  validate(schema, "query");
export const validateParams = (schema: Joi.ObjectSchema) =>
  validate(schema, "params");
