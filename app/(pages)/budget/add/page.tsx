/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Period } from "@/global/dto";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { BudgetReq } from "@/global/dto";
import FetchToken from "@/utils/fetch_token";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

const budgetSchema = z.object({
  Category: z.object({
    id: z.string().min(1, "Category is required"),
  }),
  User: z.object({
    id: z.string().min(1, "User ID is required"),
  }),
  amountLimit: z.coerce.number().min(1, "Amount must be greater than 0"),
  period: z.enum([Period.Weekly, Period.Monthly, Period.Yearly, Period.Custom]),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
});

export default function AddBudgetPage() {
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();
  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      Category: { id: "" },
      User: { id: user.id || "" },
      amountLimit: 0,
      period: Period.Monthly,
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0],
    },
  });
  const watchPeriod = form.watch("period");
  const [loader, setLoader] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const start = new Date();
    let newStart = new Date(start);
    let newEnd = new Date(start);

    if (watchPeriod === Period.Weekly) {
      const day = start.getDay();
      newStart.setDate(start.getDate() - day); // Sunday
      newEnd = new Date(newStart);
      newEnd.setDate(newStart.getDate() + 6); // Saturday
    } else if (watchPeriod === Period.Monthly) {
      newStart = new Date(start.getFullYear(), start.getMonth(), 1);
      newEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    } else if (watchPeriod === Period.Yearly) {
      newStart = new Date(start.getFullYear(), 0, 1);
      newEnd = new Date(start.getFullYear(), 11, 31);
    }

    form.setValue("startDate", newStart.toISOString().split("T")[0]);
    form.setValue("endDate", newEnd.toISOString().split("T")[0]);
  }, [watchPeriod, form]);

  async function onSubmit(data: z.infer<typeof budgetSchema>) {
    try {
      setLoader(true);
      const api_url = process.env.NEXT_PUBLIC_API_URL + "/budgets/create";
      const budgetData: BudgetReq = {
        category: {
          id: data.Category.id,
        },
        user: {
          id: data.User.id,
        },
        amountLimit: data.amountLimit,
        period: data.period,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      });
      const resData = await response.json();

      if (!response.ok) {
        toast("Failed to create budget", {
          description: resData.error || "Something went wrong.",
        });
        return;
      }
      toast("Budget created successfully!", {
        description: "Your budget has been added.",
        action: {
          label: "View Budgets",
          onClick: () => {
            router.push("/budget");
          },
        },
      });

      form.reset();
    } catch (error) {
      console.error("Error:", error);
      toast("Error", {
        description: "Failed to create budget. Please try again.",
      });
    } finally {
      setLoader(false);
    }
  }

  return (
    <div className="w-full pb-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full max-w-xl mx-auto mb-8">
            <CardHeader>
              <CardTitle>Add Budget</CardTitle>
              <CardDescription>
                Set your budget for a desired category and timeframe
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Category */}
              <FormField
                control={form.control}
                name="Category.id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
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
              {/* Amount */}
              <FormField
                control={form.control}
                name="amountLimit"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter budget amount"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the amount for the budget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Period */}
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Timeframe</FormLabel>
                    <FormControl>
                      <Tabs
                        value={field.value}
                        onValueChange={(value) =>
                          field.onChange(value as Period)
                        }
                        className="flex flex-wrap overflow-auto"
                      >
                        <TabsList>
                          <TabsTrigger value={Period.Weekly}>
                            Weekly
                          </TabsTrigger>
                          <TabsTrigger value={Period.Monthly}>
                            Monthly
                          </TabsTrigger>
                          <TabsTrigger value={Period.Yearly}>
                            Yearly
                          </TabsTrigger>
                          <TabsTrigger value={Period.Custom}>
                            Custom
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormControl>
                    <FormDescription>
                      Select the timeframe for the budget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={watchPeriod !== Period.Custom}
                        className="w-full min-w-0"
                      />
                    </FormControl>
                    <FormDescription>
                      Select the start date for the budget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={watchPeriod !== Period.Custom}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the end date for the budget
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={loader}>
                {loader && <Spinner />}
                {loader ? "Creating..." : "Create Budget"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
