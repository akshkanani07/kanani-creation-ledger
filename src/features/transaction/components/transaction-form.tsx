"use client";

/**
 * Transaction Form — Create & Edit
 * 
 * FEATURES:
 * - React Hook Form + Zod validation
 * - Karigar selector (searchable dropdown)
 * - Transaction type selector (premium cards)
 * - Amount, Quantity, Rate fields
 * - Auto-calculate amount from quantity × rate
 * - Payment mode (conditional for Payment/Advance)
 * - Reference, Description, Date
 * - Live direction indicator
 * 
 * USAGE:
 *   <TransactionForm mode="create" defaultKarigarId={karigarId} />
 *   <TransactionForm mode="edit" initialData={transaction} />
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X, Calculator, Calendar, User, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { ROUTES, PAYMENT_MODES, PAYMENT_MODE_LABELS } from "@/config/constants";
import {
  transactionSchema,
  TYPE_DEFAULT_DIRECTION,
  type TransactionSchemaInput,
} from "../schemas/transaction.schema";
import type { Transaction, TransactionInput, KarigarOption } from "../types";
import { createTransaction } from "../actions/create-transaction";
import { updateTransaction } from "../actions/update-transaction";
import { TransactionTypeSelector } from "./transaction-type-selector";
import { getKarigars } from "@/features/karigar/actions/get-karigars";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface TransactionFormProps {
  mode: "create" | "edit";
  initialData?: Transaction & {
    karigar?: { id: string; name: string; phone: string };
  };
  defaultKarigarId?: string;
}

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

export function TransactionForm({
  mode,
  initialData,
  defaultKarigarId,
}: TransactionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [karigars, setKarigars] = useState<KarigarOption[]>([]);
  const [loadingKarigars, setLoadingKarigars] = useState(true);

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
    control,
  } = useForm<TransactionSchemaInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      karigarId: initialData?.karigarId ?? defaultKarigarId ?? "",
      type: initialData?.type ?? "WORK",
      direction: initialData?.direction,
      amount: initialData?.amount ?? 0,
      quantity: initialData?.quantity ?? undefined,
      rate: initialData?.rate ?? undefined,
      paymentMode: initialData?.paymentMode ?? undefined,
      reference: initialData?.reference ?? "",
      description: initialData?.description ?? "",
      transactionDate: initialData?.transactionDate ?? new Date(),
    },
  });

  const watchedType = watch("type");
  const watchedQuantity = watch("quantity");
  const watchedRate = watch("rate");
  const watchedAmount = watch("amount");
  const watchedKarigarId = watch("karigarId");

  const isWork = watchedType === "WORK";
  const isPaymentOrAdvance =
    watchedType === "PAYMENT" || watchedType === "ADVANCE";
  const currentDirection = TYPE_DEFAULT_DIRECTION[watchedType];

  // ═══════════════════════════════════════════
  // LOAD KARIGARS
  // ═══════════════════════════════════════════
  useEffect(() => {
    let mounted = true;

    (async () => {
      const result = await getKarigars({ isActive: true, limit: 100 });
      if (mounted && result.success) {
        const options: KarigarOption[] = result.data.items.map((k) => ({
          value: k.id,
          label: k.name,
          phone: k.phone,
          balance: k.balance,
        }));
        setKarigars(options);
      }
      setLoadingKarigars(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ═══════════════════════════════════════════
  // AUTO-CALCULATE AMOUNT (Work)
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (isWork && watchedQuantity && watchedRate) {
      const calculated = Number(watchedQuantity) * Number(watchedRate);
      if (Number.isFinite(calculated)) {
        setValue("amount", Math.round(calculated * 100) / 100, {
          shouldValidate: false,
        });
      }
    }
  }, [watchedQuantity, watchedRate, isWork, setValue]);

  // ═══════════════════════════════════════════
  // SELECTED KARIGAR INFO
  // ═══════════════════════════════════════════
  const selectedKarigar = karigars.find((k) => k.value === watchedKarigarId);

  // ═══════════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════════
  const onSubmit = async (data: TransactionSchemaInput) => {
    setIsSubmitting(true);

    try {
      const payload: TransactionInput = {
        karigarId: data.karigarId,
        type: data.type,
        amount: Number(data.amount),
        quantity: data.quantity ? Number(data.quantity) : undefined,
        rate: data.rate ? Number(data.rate) : undefined,
        paymentMode: data.paymentMode ?? undefined,
        reference: data.reference || undefined,
        description: data.description,
        transactionDate:
          data.transactionDate instanceof Date
            ? data.transactionDate
            : new Date(data.transactionDate ?? Date.now()),
      };

      const result =
        mode === "create"
          ? await createTransaction(payload)
          : await updateTransaction({ id: initialData!.id, ...payload });

      if (result.success) {
        toast.success(
          mode === "create"
            ? "Transaction created successfully"
            : "Transaction updated successfully"
        );
        router.push(ROUTES.TRANSACTIONS);
        router.refresh();
      } else {
        toast.error(result.error);

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof TransactionSchemaInput, {
              message: messages[0],
            });
          });
        }
      }
    } catch (error) {
      console.error("[TransactionForm] Submit error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════
  // CANCEL
  // ═══════════════════════════════════════════
  const handleCancel = () => {
    router.push(ROUTES.TRANSACTIONS);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      
      {/* ═══════════════════════════════════════════ */}
      {/* KARIGAR SELECTOR */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            Karigar
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select the karigar for this transaction
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-700">
            Karigar <span className="text-red-500">*</span>
          </Label>
          <Select
            value={watchedKarigarId}
            onValueChange={(val) =>
              setValue("karigarId", val, { shouldValidate: true })
            }
            disabled={isSubmitting || loadingKarigars || mode === "edit"}
          >
            <SelectTrigger
              className={cn(
                "h-11 rounded-xl",
                errors.karigarId && "border-red-300"
              )}
            >
              <SelectValue
                placeholder={
                  loadingKarigars
                    ? "Loading karigars..."
                    : "Select a karigar..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {karigars.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No active karigars found
                </div>
              ) : (
                karigars.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="font-medium">{k.label}</span>
                      <span className="text-xs text-slate-500">
                        {k.balance > 0
                          ? `${formatCurrency(k.balance)} Cr`
                          : k.balance < 0
                            ? `${formatCurrency(Math.abs(k.balance))} Dr`
                            : "Settled"}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.karigarId && (
            <p className="text-xs text-red-600">{errors.karigarId.message}</p>
          )}

          {/* Karigar Balance Preview */}
          {selectedKarigar && (
            <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-600">
                <span className="font-semibold">Current balance:</span>{" "}
                {selectedKarigar.balance > 0
                  ? `${formatCurrency(selectedKarigar.balance)} (we owe)`
                  : selectedKarigar.balance < 0
                    ? `${formatCurrency(Math.abs(selectedKarigar.balance))} (owes us)`
                    : "Settled"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* TRANSACTION TYPE */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Transaction Type
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            What kind of entry is this?
          </p>
        </div>

        <TransactionTypeSelector
          value={watchedType}
          onChange={(type) => {
            setValue("type", type, { shouldValidate: true });
            setValue("direction", TYPE_DEFAULT_DIRECTION[type]);
            // Clear conditional fields when type changes
            if (type !== "WORK") {
              setValue("quantity", undefined);
              setValue("rate", undefined);
            }
            if (type !== "PAYMENT" && type !== "ADVANCE") {
              setValue("paymentMode", undefined);
            }
          }}
          disabled={isSubmitting}
        />

        {errors.type && (
          <p className="text-xs text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* AMOUNT + WORK DETAILS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-slate-500" />
            Amount Details
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isWork
              ? "Enter quantity and rate to auto-calculate"
              : "Enter the transaction amount"}
          </p>
        </div>

        {/* Quantity + Rate (Work only) */}
        {isWork && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity" className="text-xs font-medium text-slate-700">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="e.g., 50"
                {...register("quantity")}
                disabled={isSubmitting}
                className={cn(
                  "h-11 rounded-xl",
                  errors.quantity && "border-red-300"
                )}
              />
              {errors.quantity && (
                <p className="text-xs text-red-600">{errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rate" className="text-xs font-medium text-slate-700">
                Rate (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                inputMode="decimal"
                placeholder="e.g., 12"
                {...register("rate")}
                disabled={isSubmitting}
                className={cn(
                  "h-11 rounded-xl",
                  errors.rate && "border-red-300"
                )}
              />
              {errors.rate && (
                <p className="text-xs text-red-600">{errors.rate.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-xs font-medium text-slate-700">
            Amount (₹) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-medium">
              ₹
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              {...register("amount")}
              disabled={isSubmitting || isWork}
              className={cn(
                "h-11 rounded-xl pl-8 text-base font-semibold tabular-nums",
                errors.amount && "border-red-300",
                isWork && "bg-slate-50 cursor-not-allowed"
              )}
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-red-600">{errors.amount.message}</p>
          )}

          {isWork && watchedAmount > 0 && (
            <p className="text-[11px] text-emerald-600 font-medium">
              Auto-calculated: {formatCurrency(Number(watchedAmount))}
            </p>
          )}
        </div>

        {/* Direction Indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
          <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <p className="text-[11px] text-slate-600">
            This entry will{" "}
            <span
              className={cn(
                "font-semibold",
                currentDirection === "CREDIT"
                  ? "text-emerald-600"
                  : "text-amber-600"
              )}
            >
              {currentDirection === "CREDIT"
                ? "add to what we owe karigar (CREDIT)"
                : "reduce what we owe karigar (DEBIT)"}
            </span>
          </p>
        </div>

        {/* Payment Mode */}
        {isPaymentOrAdvance && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              Payment Mode <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("paymentMode") ?? ""}
              onValueChange={(val) =>
                setValue(
                  "paymentMode",
                  val as keyof typeof PAYMENT_MODE_LABELS,
                  { shouldValidate: true }
                )
              }
              disabled={isSubmitting}
            >
              <SelectTrigger
                className={cn(
                  "h-11 rounded-xl",
                  errors.paymentMode && "border-red-300"
                )}
              >
                <SelectValue placeholder="Select mode..." />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PAYMENT_MODES).map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {PAYMENT_MODE_LABELS[mode]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMode && (
              <p className="text-xs text-red-600">
                {errors.paymentMode.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* DETAILS */}
      {/* ═══════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white border border-slate-200/60 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Additional Details
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Description and reference information
          </p>
        </div>

        {/* Reference */}
        <div className="space-y-1.5">
          <Label htmlFor="reference" className="text-xs font-medium text-slate-700">
            Reference{" "}
            <span className="text-slate-400 font-normal">(optional)</span>
          </Label>
          <Input
            id="reference"
            placeholder="e.g., INV-001, Bill #42"
            {...register("reference")}
            disabled={isSubmitting}
            className="h-11 rounded-xl"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-medium text-slate-700">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="e.g., 50 meter saree work @ ₹12/meter"
            rows={3}
            {...register("description")}
            disabled={isSubmitting}
            maxLength={500}
            className={cn(
              "rounded-xl resize-none",
              errors.description && "border-red-300"
            )}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Transaction Date */}
        <div className="space-y-1.5">
          <Label htmlFor="transactionDate" className="text-xs font-medium text-slate-700">
            Transaction Date
          </Label>
          <Input
            id="transactionDate"
            type="date"
            {...register("transactionDate")}
            disabled={isSubmitting}
            max={new Date().toISOString().split("T")[0]}
            className="h-11 rounded-xl"
          />
          {errors.transactionDate && (
            <p className="text-xs text-red-600">
              {errors.transactionDate.message}
            </p>
          )}
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
              {mode === "create" ? "Create Transaction" : "Save Changes"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}