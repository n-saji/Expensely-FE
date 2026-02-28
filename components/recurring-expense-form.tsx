"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { RootState } from "@/redux/store";
import { CreateRecurringExpenseReq, Recurrence } from "@/global/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

const recurringSchema = z.object({
  categoryId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
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
  const categories = useSelector((state: RootState) => state.categoryExpense);

  const tomorrow = useMemo(() => getTomorrowDateString(), []);

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema) as any,
    defaultValues: {
      categoryId: initialValues?.categoryId || "",
      amount: initialValues?.amount || 0,
      description: initialValues?.description || "",
      recurrence: initialValues?.recurrence || Recurrence.Monthly,
      date: initialValues?.date || tomorrow,
    },
  });

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
      await onSubmit({
        categoryId: data.categoryId || "",
        amount: data.amount,
        description: data.description,
        recurrence: data.recurrence,
        date: data.date,
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
                      {categories.categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
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

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" min={tomorrow} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
