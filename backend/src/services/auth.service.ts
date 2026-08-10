import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
    LoginSchemaType,
    RegisterSchemaType,
} from "../validators/auth.validator";

/**
 * Service to handle new user registration.
 * Checks for existing accounts by email, instantiates a new User document,
 * and persists it to the database (password hashing occurs via schema pre-save hook).
 *
 * @param body - Validated user registration payload (name, email, password, avatar).
 * @returns Promise resolving to the newly created user document.
 * @throws {UnauthorizedException} If an account with the provided email already exists.
 */
export const registerService = async (body: RegisterSchemaType) => {
    const { email } = body;

    // Check if a user with the provided email address is already registered
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new UnauthorizedException("User already exist");

    // Create and persist a new user instance
    const newUser = new UserModel({
        name: body.name,
        email: body.email,
        password: body.password,
        avatar: body.avatar,
    });

    await newUser.save();
    return newUser;
};

/**
 * Service to handle user login and credential verification.
 * Locates user by email and compares plain-text password against stored hash.
 *
 * @param body - Validated login credential payload (email, password).
 * @returns Promise resolving to the authenticated user document.
 * @throws {NotFoundException} If no user account is associated with the email.
 * @throws {UnauthorizedException} If the provided password does not match.
 */
export const loginService = async (body: LoginSchemaType) => {
    const { email, password } = body;

    // Locate user document by email
    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundException("Email or Password not found");

    // Verify plain-text password against stored bcrypt hash using instance method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
        throw new UnauthorizedException("Invaild email or password");

    return user;
};