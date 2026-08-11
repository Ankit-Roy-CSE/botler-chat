import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

/**
 * Zod validation schema for the sign-up form.
 * Ensures all required user inputs adhere to expected validation rules:
 * - `name`: Non-empty string.
 * - `email`: Valid email format.
 * - `password`: Minimum length of 6 characters.
 */
const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Type definition inferred automatically from `formSchema`.
 */
type SignUpFormValues = z.infer<typeof formSchema>;

/**
 * `SignUp` Component
 *
 * Renders a user registration card containing a form managed by `react-hook-form`
 * and validated via `zod`. Communicates with the global `useAuth` hook to trigger
 * account creation and display loading spinners.
 *
 * @returns JSX Element rendering the sign-up view.
 */
const SignUp = () => {
    // Auth hook containing registration logic and pending request state
    const { register, isSigningUp } = useAuth();

    /**
     * React Hook Form setup with Zod resolver for automated schema-based validation.
     */
    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    /**
     * Form submit handler triggered after validation checks pass.
     * Prevents re-submission if an active sign-up request is already pending.
     *
     * @param values Validated form values matching `SignUpFormValues`.
     */
    const onSubmit = (values: SignUpFormValues) => {
        if (isSigningUp) return;
        register(values);
    };

    return (
        // Fullscreen viewport wrapper centered vertically and horizontally
        <div className="flex min-h-svh items-center justify-center bg-muted p-6">
            <div className="w-full max-w-sm">
                {/* Main Auth Card Container */}
                <Card>
                    {/* Header: Displays Application Logo & Page Title */}
                    <CardHeader className="flex flex-col items-center justify-center gap-3">
                        <Logo />
                        <CardTitle className="text-xl">Create your account</CardTitle>
                    </CardHeader>

                    {/* Content: Contains Form and Link Navigation */}
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="grid gap-4"
                            >
                                {/* Name Input Field */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email Input Field */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="johndoe@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Password Input Field */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="******"
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Action Button with Loading Indicator */}
                                <Button
                                    disabled={isSigningUp}
                                    type="submit"
                                    className="w-full gap-2"
                                >
                                    {isSigningUp && <Spinner />}
                                    <span>Sign Up</span>
                                </Button>

                                {/* Redirection Link for Existing Users */}
                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link to="/" className="underline">
                                        Sign in
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SignUp;