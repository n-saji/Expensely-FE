"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import api from "@/lib/api";
import { Category, CreateIncomeReq } from "@/global/dto";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ChevronDown } from "lucide-react";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateForApi(date: string) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${date}T${hh}:${mm}:${ss}`;
}

export default function AddIncomePage() {
  const user = useSelector((state: RootState) => state.user);

  const [saving, setSaving] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    description: "",
    incomeDate: today(),
  });

  const fetchCategories = useCallback(async () => {
    if (!user.id) return;

    try {
      setCategoriesLoading(true);
      const res = await api.get(`/categories/user?type=income`);
      if (res.status !== 200) {
        throw new Error("Failed to fetch income categories");
      }
      setCategories(res.data || []);
    } catch (error) {
      toast.error("Failed to load income categories", {
        description: String(error),
      });
    } finally {
      setCategoriesLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchCategories();

    const categoryAddedHandler = () => fetchCategories();
    window.addEventListener("category-added", categoryAddedHandler);
    return () =>
      window.removeEventListener("category-added", categoryAddedHandler);
  }, [fetchCategories]);

  const handleCreateIncome = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number.parseFloat(form.amount);

    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      setSaving(true);

      const payload: CreateIncomeReq = {
        category: { id: form.categoryId },
        amount,
        description: form.description,
        incomeDate: formatDateForApi(form.incomeDate),
      };

      const res = await api.post("/incomes/create", payload);
      if (res.status !== 200) {
        throw new Error("Failed to create income");
      }

      setForm({
        categoryId: "",
        amount: "",
        description: "",
        incomeDate: today(),
      });

      window.dispatchEvent(new Event("income-added"));
      toast.success("Income created successfully");
    } catch (error) {
      toast.error("Failed to create income", {
        description: String(error),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Ledger
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Add Income
        </h1>
        <p className="text-sm text-muted-foreground">
          Record a new income entry.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm overflow-hidden max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Income</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateIncome} className="space-y-4">
            <Input
              placeholder="Description"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  description: event.target.value,
                }))
              }
            />

            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="Amount"
              value={form.amount}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, amount: event.target.value }))
              }
            />

            <Select
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, categoryId: value }))
              }
              value={form.categoryId}
              disabled={categoriesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? "Loading categories..."
                      : "Select category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between text-muted-foreground"
                >
                  {form.incomeDate || "Select date"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    form.incomeDate
                      ? new Date(`${form.incomeDate}T00:00:00`)
                      : undefined
                  }
                  onSelect={(date) => {
                    if (!date) return;
                    setForm((prev) => ({
                      ...prev,
                      incomeDate: date.toISOString().slice(0, 10),
                    }));
                    setDatePickerOpen(false);
                  }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? <Spinner /> : "Add Income"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
