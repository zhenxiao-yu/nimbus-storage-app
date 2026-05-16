"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

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
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";

const OtpModal = ({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    setIsLoading(true);
    try {
      const sessionId = await verifySecret({ accountId, password });
      if (sessionId) {
        toast.success("Signed in.");
        router.push("/dashboard");
      } else {
        toast.error("That code didn't work. Try again or resend.");
      }
    } catch {
      toast.error("That code didn't work. Try again or resend.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await sendEmailOTP({ email });
      toast.success("New code sent — check your inbox.");
    } catch {
      toast.error("Couldn't resend the code. Try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
        <AlertDialogHeader className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="ring-focus absolute right-0 top-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
          <AlertDialogTitle className="h3 text-center">
            Enter your code
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-center py-2">
          <InputOTP maxLength={6} value={password} onChange={setPassword}>
            <InputOTPGroup className="gap-1.5 sm:gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="size-10 rounded-lg border-2 text-base sm:size-12 sm:text-lg md:size-14 md:text-xl"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <AlertDialogFooter className="flex-col gap-3">
          <AlertDialogAction
            onClick={handleSubmit}
            className="h-11 w-full"
            type="button"
          >
            {isLoading && (
              <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
            )}
            Verify and continue
          </AlertDialogAction>
          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t get a code?{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm font-medium"
              disabled={resending}
              onClick={handleResendOtp}
            >
              {resending ? "Sending…" : "Resend"}
            </Button>
          </p>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OtpModal;
