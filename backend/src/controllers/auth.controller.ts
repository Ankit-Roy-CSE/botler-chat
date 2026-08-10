import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { loginService, registerService } from "../services/auth.service";
import { clearJwtAuthCookie, setJwtAuthCookie } from "../utils/cookie";
import { HTTPSTATUS } from "../config/http.config";

/**
 * Controller handler for user registration.
 * Validates request payload, delegates account creation to `registerService`,
 * sets an HTTP-only JWT authentication cookie, and returns the newly created user profile.
 *
 * @route POST /api/auth/register
 * @access Public
 */
export const registerController = asyncHandler(
    async (req: Request, res: Response) => {
        // Validate request payload against Zod registration schema
        const body = registerSchema.parse(req.body);

        // Delegate account creation logic to the authentication service
        const user = await registerService(body);
        const userId = user._id.toString();

        // Attach JWT auth cookie to response and send 201 Created status
        return setJwtAuthCookie({
            res,
            userId,
        })
            .status(HTTPSTATUS.CREATED)
            .json({
                message: "User created & login successfully",
                user,
            });
    }
);

/**
 * Controller handler for user login.
 * Validates credentials against Zod login schema, verifies user via `loginService`,
 * issues an HTTP-only JWT cookie upon successful validation, and returns user details.
 *
 * @route POST /api/auth/login
 * @access Public
 */
export const loginController = asyncHandler(
    async (req: Request, res: Response) => {
        // Validate request body credentials against Zod login schema
        const body = loginSchema.parse(req.body);

        // Verify user credentials and fetch user document
        const user = await loginService(body);
        const userId = user._id.toString();

        // Issue JWT cookie and respond with 200 OK status
        return setJwtAuthCookie({
            res,
            userId,
        })
            .status(HTTPSTATUS.OK)
            .json({
                message: "User login successfully",
                user,
            });
    }
);

/**
 * Controller handler for user logout.
 * Clears the `accessToken` HTTP-only auth cookie from the client session.
 *
 * @route POST /api/auth/logout
 * @access Private / Authenticated
 */
export const logoutController = asyncHandler(
    async (req: Request, res: Response) => {
        // Clear JWT access token cookie and acknowledge logout
        return clearJwtAuthCookie(res).status(HTTPSTATUS.OK).json({
            message: "User logout successfully",
        });
    }
);

/**
 * Controller handler to check current user authentication status.
 * Returns the currently authenticated user attached to the request by the auth middleware.
 *
 * @route GET /api/auth/status
 * @access Private / Authenticated
 */
export const authStatusController = asyncHandler(
    async (req: Request, res: Response) => {
        // Extract authenticated user document attached to request payload
        const user = req.user;

        return res.status(HTTPSTATUS.OK).json({
            message: "Authenticated User",
            user,
        });
    }
);