import { Request, Response, NextFunction } from "express";

/**
 * Type definition for asynchronous Express controller functions.
 * Accepts standard Express middleware parameters and returns a Promise.
 */
type AsyncController = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

/**
 * Higher-Order Function (HOF) wrapper for asynchronous Express route handlers.
 * Eliminates the need for repetitive try-catch blocks in async controllers
 * by automatically catching rejected promises and forwarding errors to Express middleware.
 *
 * @param controller - The async controller function to wrap.
 * @returns An Express middleware function with automatic error catching.
 */
export const asyncHandler =
    (controller: AsyncController) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                // Execute the wrapped asynchronous controller logic
                await controller(req, res, next);
            } catch (error) {
                // Delegate caught asynchronous errors to the Express error-handling pipeline
                next(error);
            }
        };