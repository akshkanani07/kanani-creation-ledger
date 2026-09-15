"use client";

/**
 * Email Change Form
 * 
 * FEATURES:
 * - Current email display
 * - New email input
 * - Send verification button
 * - Success state (waiting for verification)
 * - Error handling
 * 
 * USAGE:
 *   <EmailChangeForm currentEmail="owner@example.com" />
 */

import { useState, useTransition } from "react";
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { requestEmailChange } from "../actions/request-email-change";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface EmailChangeFormProps {
  currentEmail: string;
}

type FormState = "idle" | "sent";

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // ═══════════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════════
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!newEmail.trim()) {
      setError("Please enter a new email");
      return;
    }

    if (newEmail.toLowerCase().trim() === currentEmail.toLowerCase()) {
      setError("New email is same as current email");
      return;
    }

    startTransition(async () => {
      const result = await requestEmailChange({ newEmail });

      if (result.success) {
        setSentTo(result.data.newEmail);
        setState("sent");
        toast.success(result.message);
      } else {
        setError(result.error);
        toast.error(result.error);
      }
    });
  };

  // ═══════════════════════════════════════════
  // RESET (Try Again)
  // ═══════════════════════════════════════════
  const handleReset = () => {
    setIsOpen(false);
    setState("idle");
    setNewEmail("");
    setSentTo("");
    setError("");
  };

  // ═══════════════════════════════════════════
  // SUCCESS STATE
  // ═══════════════════════════════════════════
  if (state === "sent") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center text-center p-5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Verification email sent
          </h3>
          <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
            We&apos;ve sent a verification link to{" "}
            <span className="font-semibold text-slate-900">{sentTo}</span>.
            Click the link to confirm your new email.
          </p>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Link expires in 15 minutes.</strong> Old email remains active
              until verification.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-10 rounded-lg"
          >
            Done
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setState("idle");
              setError("");
            }}
            className="flex-1 h-10 rounded-lg"
          >
            Send Again
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // IDLE STATE — Not Open
  // ═══════════════════════════════════════════
  if (!isOpen) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Current Email
            </p>
            <p className="text-sm font-medium text-slate-900 truncate">
              {currentEmail}
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="w-full h-10 rounded-lg"
        >
          <Mail className="w-3.5 h-3.5 mr-2" />
          Change Email
        </Button>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // FORM STATE — Editing
  // ═══════════════════════════════════════════
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current Email (Read-only) */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Current Email
          </p>
          <p className="text-xs text-slate-500 truncate">{currentEmail}</p>
        </div>
        <X
          className="w-3.5 h-3.5 text-slate-300 flex-shrink-0"
          strokeWidth={2.5}
        />
      </div>

      {/* New Email Input */}
      <div className="space-y-1.5">
        <Label
          htmlFor="newEmail"
          className="text-xs font-medium text-slate-700"
        >
          New Email Address <span className="text-red-500">*</span>
        </Label>
        <Input
          id="newEmail"
          type="email"
          placeholder="new-email@example.com"
          value={newEmail}
          onChange={(e) => {
            setNewEmail(e.target.value);
            setError("");
          }}
          disabled={isPending}
          autoFocus
          autoComplete="email"
          className={cn(
            "h-11 rounded-xl",
            error && "border-red-300 focus-visible:ring-red-500/20"
          )}
        />
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
        <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-800 leading-relaxed">
          We&apos;ll send a verification link to your <strong>new email</strong>.
          Your old email remains active until you verify.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsOpen(false);
            setNewEmail("");
            setError("");
          }}
          disabled={isPending}
          className="flex-1 h-10 rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !newEmail.trim()}
          className="flex-1 h-10 rounded-lg bg-slate-900 hover:bg-slate-800"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 mr-2" />
              Send Verification
            </>
          )}
        </Button>
      </div>
    </form>
  );
}