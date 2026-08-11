import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "react-router-dom";

/**
 * Zod validation schema for the sign-in form.
 * Ensures all required user inputs adhere to expected validation rules:
 * - `email`: Valid email format.
 * - `password`: Minimum length of 6 characters.
 */
const formSchema = z.object({
    email: z.string().email("Invalid email").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * Type definition inferred automatically from `formSchema`.
 */
type SignInFormValues = z.infer<typeof formSchema>;

/**
 * `SignIn` Component
 *
 * Renders a user authentication card containing a login form managed by `react-hook-form`
 * and validated via `zod`. Communicates with the global `useAuth` hook to trigger
 * the login process and display loading states.
 *
 * @returns JSX Element rendering the sign-in view.
 */
const SignIn = () => {
    // Auth hook containing login logic and pending request state
    const { login, isLoggingIn } = useAuth();

    /**
     * React Hook Form setup with Zod resolver for automated schema-based validation.
     */
    const form = useForm<SignInFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    /**
     * Form submit handler triggered after validation checks pass.
     * Prevents re-submission if an active login request is already pending.
     *
     * @param values Validated form values matching `SignInFormValues`.
     */
    const onSubmit = (values: SignInFormValues) => {
        if (isLoggingIn) return;
        login(values);
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
                        <CardTitle className="text-xl">Sign in to your account</CardTitle>
                    </CardHeader>

                    {/* Content: Contains Form and Link Navigation */}
                    <CardContent>
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="grid gap-4"
                            >
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
                                <Button disabled={isLoggingIn} type="submit" className="w-full gap-2">
                                    {isLoggingIn && <Spinner data-icon="inline-start" />}
                                    <span>Sign In</span>
                                </Button>

                                {/* Redirection Link for New Users */}
                                <div className="text-center text-sm text-muted-foreground">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/sign-up"
                                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                                    >
                                        Sign Up
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

export default SignIn;