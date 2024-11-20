"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Import UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { Button } from "@/components/ui/button";

// Import user actions
import { verifySecret, sendEmailOTP } from "@/lib/actions/user.actions";

/**
 * OTP Modal Component
 * Handles OTP submission and resending for authentication.
 *
 * @param accountId - User's account ID for OTP verification.
 * @param email - User's email to resend OTP if needed.
 */
const OtpModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter(); // Navigation hook
  const [isOpen, setIsOpen] = useState(true); // Modal open state
  const [password, setPassword] = useState(""); // OTP input state
  const [isLoading, setIsLoading] = useState(false); // Loading state for submission

  /**
   * Handles OTP submission.
   * Verifies the entered OTP and redirects to the home page if successful.
   */
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const sessionId = await verifySecret({ accountId, password }); // Verify OTP

      if (sessionId) router.push("/"); // Redirect to home on success
    } catch (error) {
      console.error("Failed to verify OTP", error); // Log verification error
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  /**
   * Resends the OTP to the user's email.
   */
  const handleResendOtp = async () => {
    try {
      await sendEmailOTP({ email }); // Resend OTP
    } catch (error) {
      console.error("Failed to resend OTP", error); // Log resend error
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          {/* Modal title and close button */}
          <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)} // Close modal
              className="otp-close-button cursor-pointer"
            />
          </AlertDialogTitle>
          {/* OTP description */}
          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We&apos;ve sent a code to{" "}
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* OTP input component */}
        <InputOTP maxLength={6} value={password} onChange={setPassword}>
          <InputOTPGroup className="shad-otp">
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="shad-otp-slot"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            {/* Submit button */}
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            {/* Resend OTP link */}
            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn&apos;t get a code?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
                onClick={handleResendOtp}
              >
                Click to resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
