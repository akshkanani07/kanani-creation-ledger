"use client";

/**
 * Karigar Form — Create & Edit
 * 
 * FEATURES:
 * - React Hook Form + Zod validation
 * - Photo upload (Cloudinary)
 * - Opening Balance (create only)
 * - Fields: name, phone, address, isActive
 * - Real-time field errors
 * - Mode: create / edit
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X, Wallet, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency } from "@/lib/utils";
import { ROUTES, VALIDATION } from "@/config/constants";

import {
  karigarSchema,
  type KarigarSchemaInput,
} from "../schemas/karigar.schema";
import type { Karigar, KarigarInput } from "../types";
import { createKarigar } from "../actions/create-karigar";
import { updateKarigar } from "../actions/update-karigar";
import { KarigarPhotoUpload, type PhotoValue } from "./karigar-photo-upload";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface KarigarFormProps {
  mode: "create" | "edit";
  initialData?: Karigar;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function KarigarForm({ mode, initialData }: KarigarFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState<PhotoValue>({
    url: initialData?.photoUrl ?? null,
    id: initialData?.photoId ?? null,
  });

  // ═══════════════════════════════════════════
  // FORM
  // ═══════════════════════════════════════════
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<KarigarSchemaInput>({
    resolver: zodResolver(karigarSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      phone: initialData?.phone ?? "",
      address: initialData?.address ?? "",
      photoUrl: initialData?.photoUrl ?? "",
      photoId: initialData?.photoId ?? "",
      openingBalance: 0,
      isActive: initialData?.isActive ?? true,
    },
  });

  const isActiveValue = watch("isActive");
  const openingBalanceValue = watch("openingBalance");

  // ═══════════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════════
  const onSubmit = async (data: KarigarSchemaInput) => {
    setIsSubmitting(true);

    try {
      const payload: KarigarInput = {
        name: data.name,
        phone: data.phone,
        address: data.address || undefined,
        photoUrl: photo.url || undefined,
        photoId: photo.id || undefined,
        isActive: data.isActive,
      };

      const result =
        mode === "create"
          ? await createKarigar({
              ...payload,
              openingBalance: Number(data.openingBalance) || 0,
            })
          : await updateKarigar({ id: initialData!.id, ...payload });

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Karigar created successfully"
            : "Karigar updated successfully"
        );
        router.push(ROUTES.KARIGAR);
        router.refresh();
      } else {
        toast.error(result.error);

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof KarigarSchemaInput, {
              message: messages[0],
            });
          });
        }
      }
    } catch (error) {
      console.error("[KarigarForm] Submit error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════
  // CANCEL
  // ═══════════════════════════════════════════
  const handleCancel = () => {
    router.push(ROUTES.KARIGAR);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* PHOTO UPLOAD */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-5">
        <KarigarPhotoUpload
          value={photo}
          onChange={setPhoto}
          name={watch("name")}
          disabled={isSubmitting}
        />
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* BASIC INFORMATION */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-5 space-y-5">
        
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Basic Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Karigar&apos;s name and contact details
          </p>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium text-slate-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., Rajesh Kumar"
            {...register("name")}
            disabled={isSubmitting}
            className={cn(
              "h-11 rounded-xl",
              errors.name && "border-red-300 focus-visible:ring-red-500/20"
            )}
          />
          {errors.name && (
            <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium text-slate-700">
            Mobile Number <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              {...register("phone")}
              disabled={isSubmitting}
              maxLength={10}
              className={cn(
                "h-11 rounded-xl pl-12 tracking-wide",
                errors.phone && "border-red-300 focus-visible:ring-red-500/20"
              )}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-600 mt-0.5">
              {errors.phone.message}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            10-digit Indian mobile number
          </p>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="address" className="text-xs font-medium text-slate-700">
            Address <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="address"
            placeholder="House / Street / Area / City"
            rows={3}
            {...register("address")}
            disabled={isSubmitting}
            maxLength={VALIDATION.ADDRESS_MAX}
            className={cn(
              "rounded-xl resize-none",
              errors.address && "border-red-300 focus-visible:ring-red-500/20"
            )}
          />
          {errors.address && (
            <p className="text-xs text-red-600 mt-0.5">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* 🆕 Opening Balance (Create Mode Only) */}
        {mode === "create" && (
          <div className="space-y-2 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <Label
                  htmlFor="openingBalance"
                  className="text-xs font-semibold text-slate-900"
                >
                  Opening Balance (₹)
                </Label>
                <p className="text-[10px] text-slate-500">
                  Optional • Default: 0
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium pointer-events-none">
                ₹
              </span>
              <Input
                id="openingBalance"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                {...register("openingBalance", { valueAsNumber: true })}
                disabled={isSubmitting}
                className={cn(
                  "h-11 rounded-xl pl-8 tabular-nums font-semibold bg-white",
                  errors.openingBalance && "border-red-300"
                )}
              />
            </div>

            {errors.openingBalance && (
              <p className="text-xs text-red-600">
                {errors.openingBalance.message}
              </p>
            )}

            {/* Preview */}
            {Number(openingBalanceValue) > 0 && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <Info className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <p className="text-[11px] text-emerald-700">
                  Balance will be{" "}
                  <span className="font-semibold">
                    {formatCurrency(Number(openingBalanceValue))} Cr
                  </span>{" "}
                  (we owe karigar)
                </p>
              </div>
            )}

            {Number(openingBalanceValue) === 0 && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Info className="w-3 h-3 text-slate-500 flex-shrink-0" />
                <p className="text-[11px] text-slate-600">
                  No opening balance — karigar will start with settled balance.
                </p>
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              <strong>Note:</strong> If this karigar already has pending work
              or you owe them money, enter the amount here. Otherwise leave as
              0.
            </p>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* STATUS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Label className="text-sm font-semibold text-slate-900">
              Active Status
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              {isActiveValue
                ? "Karigar is active and can receive work"
                : "Karigar is inactive (no new transactions)"}
            </p>
          </div>
          <Switch
            checked={isActiveValue}
            onCheckedChange={(checked) => setValue("isActive", checked)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ACTIONS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="h-11 rounded-xl sm:w-auto w-full"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 rounded-xl sm:w-auto w-full bg-slate-900 hover:bg-slate-800"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === "create" ? "Create Karigar" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}