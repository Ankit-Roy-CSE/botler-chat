import jwt from "jsonwebtoken";
import { Response } from "express";
import { Env } from "../config/env.config";

/**
 * Utility template literal type representing valid time string formats for JWT expiration (e.g., "15m", "7d", "24h").
 */
type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

/**
 * Input parameter type interface for the `setJwtAuthCookie` helper function.
 */
type Cookie = {
    res: Response;
    userId: string;
};

/**
 * Generates a signed JSON Web Token (JWT) for an authenticated user and attaches it
 * to the HTTP response object as an HTTP-only cookie.
 *
 * @param params - Object containing the Express Response object and target User ID.
 * @param params.res - The Express Response object used to send the cookie.
 * @param params.userId - The unique MongoDB ObjectId string of the authenticated user.
 * @returns The Express Response object with the `accessToken` cookie attached.
 */
export const setJwtAuthCookie = ({ res, userId }: Cookie) => {
    // Define token payload containing essential user identification metadata
    const payload = { userId };
    const expiresIn = Env.JWT_TTL as Time;

    // Sign the JWT payload using the application secret and standard claims
    const token = jwt.sign(payload, Env.JWT_SECRET, {
        audience: ["user"],
        expiresIn: expiresIn || "7d",
    });

    // Attach the signed JWT as a secure, HTTP-only cookie to mitigate XSS attacks
    return res.cookie("accessToken", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie lifetime: 7 days in milliseconds
        httpOnly: true,                  // Prevents client-side JavaScript access
        secure: Env.NODE_ENV === "production", // Enforces HTTPS transmission in production
        sameSite: Env.NODE_ENV === "production" ? "strict" : "lax", // Prevents CSRF attacks
    });
};

/**
 * Clears the `accessToken` HTTP-only cookie from the client browser to log out the user.
 *
 * @param res - The Express Response object.
 * @returns The Express Response object with the `accessToken` cookie removed.
 */
export const clearJwtAuthCookie = (res: Response) =>
    res.clearCookie("accessToken", { path: "/" });