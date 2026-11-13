"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RootState } from "@/redux/store";
import { CreateRecurringExpenseReq, Recurrence } from "@/global/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Bell, ChevronDown, Mail } from "lucide-react";
import CategoryBadge from "@/components/category-badge";
import CurrencyDrawer from "@/components/currency-drawer";

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

const recurringSchema = z
  .object({
    categoryId: z.string().optional(),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    currency: z.string().min(1, "Currency is required"),
    description: z.string().min(1, "Description is required"),
    recurrence: z.nativeEnum(Recurrence),
    date: z
      .string()
      .min(1, "Start date is required")
      .refine((value) => {
        const selected = new Date(`${value}T00:00:00`);
        const tomorrow = new Date(`${getTomorrowDateString()}T00:00:00`);
        return selected >= tomorrow;
      }, "Start date must be tomorrow or later"),
    emailNotificationEnabled: z.boolean(),
    inAppNotificationEnabled: z.boolean(),
    notificationDaysBefore: z.array(z.number().int().min(1).max(365)),
    customNotificationDays: z.string(),
  })
  .superRefine((values, context) => {
    const customDays = values.customNotificationDays
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const invalidCustomDay = customDays.some((value) => {
      const parsed = Number(value);
      return !Number.isInteger(parsed) || parsed < 1 || parsed > 365;
    });
    if (invalidCustomDay) {
      context.addIssue({
        code: "custom",
        path: ["customNotificationDays"],
        message: "Enter whole days from 1 to 365, separated by commas",
      });
    }
    if (
      (values.emailNotificationEnabled || values.inAppNotificationEnabled) &&
      values.notificationDaysBefore.length === 0 &&
      customDays.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["notificationDaysBefore"],
        message: "Select at least one notification time",
      });
    }
  });

type RecurringFormValues = z.infer<typeof recurringSchema>;

interface RecurringExpenseFormProps {
  submitLabel: string;
  showCategory?: boolean;
  initialValues?: Partial<RecurringFormValues>;
  onSubmit: (data: CreateRecurringExpenseReq) => Promise<void>;
  onSuccess?: () => void;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export default function RecurringExpenseForm({
  submitLabel,
  showCategory = true,
  initialValues,
  onSubmit,
  onSuccess,
  showSuccessToast = true,
  successMessage,
}: RecurringExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const userCurrency = useSelector((state: RootState) => state.user.currency);

  const tomorrow = useMemo(() => getTomorrowDateString(), []);
  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema) as any,
    defaultValues: {
      categoryId: initialValues?.categoryId || "",
      amount: initialValues?.amount || 0,
      currency: initialValues?.currency || userCurrency || "USD",
      description: initialValues?.description || "",
      recurrence: initialValues?.recurrence || Recurrence.Monthly,
      date: initialValues?.date || tomorrow,
      emailNotificationEnabled:
        initialValues?.emailNotificationEnabled || false,
      inAppNotificationEnabled:
        initialValues?.inAppNotificationEnabled || false,
      notificationDaysBefore:
        initialValues?.notificationDaysBefore?.filter(
          (days) => days === 1 || days === 7,
        ) || [],
      customNotificationDays:
        initialValues?.notificationDaysBefore
          ?.filter((days) => days !== 1 && days !== 7)
          .join(", ") || "",
    },
  });

  useEffect(() => {
    if (!form.getValues("currency") && userCurrency) {
      form.setValue("currency", userCurrency || "USD");
    }
  }, [form, userCurrency]);

  const handleSubmit = async (data: RecurringFormValues) => {
    if (showCategory && !data.categoryId) {
      form.setError("categoryId", {
        type: "manual",
        message: "Category is required",
      });
      return;
    }

    try {
      setLoading(true);
      const customDays = data.customNotificationDays
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value));
      await onSubmit({
        categoryId: data.categoryId || "",
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        recurrence: data.recurrence,
        date: data.date,
        emailNotificationEnabled: data.emailNotificationEnabled,
        inAppNotificationEnabled: data.inAppNotificationEnabled,
        notificationDaysBefore: Array.from(
          new Set([...data.notificationDaysBefore, ...customDays]),
        ).sort((a, b) => b - a),
      });
      if (showSuccessToast) {
        toast.success(successMessage || "Recurring expense saved successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to save recurring expense", {
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col space-y-4 flex-1"
      >
        <div className="flex flex-col flex-1 space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Rent, subscription, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showCategory && (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.categories
                        .filter(
                          (category) =>
                            category.type?.toLowerCase() === "expense",
                        )
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <CategoryBadge
                              name={category.name}
                              icon={category.icon}
                              color={category.color}
                            />
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <CurrencyDrawer
                      value={field.value}
                      onChange={field.onChange}
                      userCurrency={userCurrency}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Popover
                    open={datePickerOpen}
                    onOpenChange={setDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between text-muted-foreground"
                      >
                        {field.value || "Select start date"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value
                            ? new Date(`${field.value}T00:00:00`)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (!date) return;
                          field.onChange(date.toISOString().slice(0, 10));
                          setDatePickerOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date(`${tomorrow}T00:00:00`)
                        }
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occurrence</FormLabel>
                <FormControl>
                  <Tabs
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as Recurrence)
                    }
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value={Recurrence.Daily}>Daily</TabsTrigger>
                      <TabsTrigger value={Recurrence.Weekly}>
                        Weekly
                      </TabsTrigger>
                      <TabsTrigger value={Recurrence.Monthly}>
                        Monthly
                      </TabsTrigger>
                      <TabsTrigger value={Recurrence.Yearly}>
                        Yearly
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/10 p-4">
            <div>
              <FormLabel>Notifications</FormLabel>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose one or both delivery methods and multiple advance
                notices.
              </p>
            </div>

            <FormField
              control={form.control}
              name="inAppNotificationEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <FormLabel className="font-normal">
                      In-app notification
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailNotificationEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <FormLabel className="font-normal">
                      Email notification
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationDaysBefore"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Notify me</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 1, label: "1 day before" },
                      { value: 7, label: "7 days before" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-sm"
                      >
                        <Checkbox
                          checked={field.value.includes(option.value)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, option.value]
                                : field.value.filter(
                                    (value) => value !== option.value,
                                  ),
                            )
                          }
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {fieldState.error && (
                    <p className="text-sm text-destructive">
                      {fieldState.error.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customNotificationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom days before</FormLabel>
                  <FormControl>
                    <Input placeholder="For example: 2, 14, 30" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Separate multiple custom notices with commas.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex w-full">
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Spinner /> : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
