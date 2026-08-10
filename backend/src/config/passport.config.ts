import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { UnauthorizedException } from "../utils/app-error";
import { Env } from "./env.config";
import { findByIdUserService } from "../services/user.service";

/**
 * Configure Passport to use the JWT (JSON Web Token) authentication strategy.
 * Extracts the JWT from HTTP-only request cookies, verifies signature/audience,
 * and attaches the authenticated user document to `req.user`.
 */
passport.use(
    new JwtStrategy(
        {
            // Custom extractor function to pull token from HTTP-only cookie
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    const token = req.cookies.accessToken;
                    if (!token) throw new UnauthorizedException("Unauthorized access");
                    return token;
                },
            ]),
            secretOrKey: Env.JWT_SECRET,
            audience: ["user"],
            algorithms: ["HS256"],
        },
        /**
         * Strategy verify callback executed upon successful token signature verification.
         *
         * @param payload - Decoded JWT payload containing `userId`.
         * @param done - Passport callback function (error, user | false).
         */
        async ({ userId }, done) => {
            try {
                // Fetch user document associated with the decoded token ID
                const user = userId && (await findByIdUserService(userId));

                // Attach user to req.user if found, otherwise reject authentication
                return done(null, user || false);
            } catch (error) {
                // Return false on internal exception to reject authentication request
                return done(null, false);
            }
        }
    )
);

/**
 * Express middleware to protect routes requiring authentication.
 * Configured with `session: false` since auth state is stateless (JWT-based).
 */
export const passportAuthenticateJwt = passport.authenticate("jwt", {
    session: false,
});