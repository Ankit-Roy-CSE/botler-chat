import { ErrorRequestHandler } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError, ErrorCodes } from "../utils/app-error";

/**
 * Global Express Error Handling Middleware.
 * Intercepts all unhandled synchronous and asynchronous errors forwarded via `next(error)`.
 * Formats error responses based on whether the error is a known operational error (`AppError`) 
 * or an unhandled internal system error.
 *
 * @param error - The error object passed from the preceding middleware/controller.
 * @param req - The Express Request object.
 * @param res - The Express Response object.
 * @param next - The Express NextFunction callback.
 */
export const errorHandler: ErrorRequestHandler = (
    error,
    req,
    res,
    next
): any => {
    // Log the error along with the endpoint path where it occurred for debugging
    console.log(`Error occurred: ${req.path}`, error);

    // Handle expected operational errors instantiated via AppError
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message,
            errorCode: error.errorCode,
        });
    }

    // Handle unexpected or native JavaScript/system errors (Fallback)
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: error?.message || "Something went wrong",
        errorCode: ErrorCodes.ERR_INTERNAL,
    });
};