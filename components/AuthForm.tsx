"use client";

import { z } from "zod"; // Schema validation library
import { zodResolver } from "@hookform/resolvers/zod"; // Resolver for integrating Zod with react-hook-form
import { useForm } from "react-hook-form"; // Form management library

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// React and Next.js imports
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Actions
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OtpModal from "@/components/OTPModal";

// Define the types of forms: login or register
type FormType = "login" | "register";

// Schema for validation based on form type
const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(), // Validate email
    fullName:
      formType === "register" // Full name is required for registration
        ? z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name can't exceed 50 characters")
        : z.string().optional(), // Optional for login
  });
};

// Main Authentication Form component
const AuthForm = ({ type }: { type: FormType }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [errorMessage, setErrorMessage] = useState(""); // Error message state
  const [accountId, setAccountId] = useState<string | null>(null); // Account ID for OTP

  // Initialize form schema and form hooks
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Use Zod for validation
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // Function to handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true); // Start loading
    setErrorMessage(""); // Clear error messages

    try {
      // Call the respective action based on the form type
      const user =
        type === "register"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
            })
          : await signInUser({ email: values.email });

      setAccountId(user.accountId); // Store the account ID for OTP modal
    } catch (error) {
      setErrorMessage("Failed to create account. Please try again."); // Handle error
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          {/* Form Title */}
          <h1 className="form-title">
            {type === "login" ? "Sign In" : "Sign Up"}
          </h1>

          {/* Full Name Field (only for registration) */}
          {type === "register" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}

          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      className="shad-input"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading} // Disable button when loading
          >
            {type === "login" ? "Sign In" : "Sign Up"}
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>

          {/* Error Message */}
          {errorMessage && <p className="error-message">*{errorMessage}</p>}

          {/* Link to switch between forms */}
          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Link
              href={type === "login" ? "/register" : "/login"}
              className="ml-1 font-medium text-brand"
            >
              {type === "login" ? "Sign Up" : "Sign In"}
            </Link>
          </div>
        </form>
      </Form>

      {/* OTP Modal */}
      {accountId && (
        <OtpModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
};

export default AuthForm;
