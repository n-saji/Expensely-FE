"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FetchUserId } from "@/utils/fetch_token";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import CategoryBadge from "@/components/category-badge";
import {
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Edit2,
  ArrowUpDown,
  RefreshCw,
  DollarSign,
  Loader2,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  category: Category;
  amount: number | null;
  currency: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "UPCOMING" | "NOTIFIED" | "COMPLETED" | "MISSED" | "SNOOZED" | "ARCHIVED";
  repeatType: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  notes: string;
  deliveryType?: "IN_APP" | "EMAIL" | "BOTH";
  notificationOffsets?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ReminderClient() {
  const userId = FetchUserId();
  const user = useSelector((state: RootState) => state.user);

  // Reminders State
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter & Pagination State
  const [statusFilter, setStatusFilter] = useState<string>("UPCOMING");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("dueAt");
  const [sortDirection, setSortDirection] = useState<string>("ASC");
  
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(8);

  // Form Sheets & Dialogs
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  
  // Snooze Dialog
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const [snoozingReminder, setSnoozingReminder] = useState<Reminder | null>(null);
  const [snoozeDuration, setSnoozeDuration] = useState<string>("30m");
  const [customSnoozeDate, setCustomSnoozeDate] = useState<string>("");

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingReminder, setDeletingReminder] = useState<Reminder | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(user.currency || "USD");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [repeatType, setRepeatType] = useState<"NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("NONE");
  const [deliveryType, setDeliveryType] = useState<"IN_APP" | "EMAIL" | "BOTH">("BOTH");
  const [notes, setNotes] = useState("");
  const [offsets, setOffsets] = useState<string[]>(["ONE_DAY"]);

  // Stats Counters
  const [stats, setStats] = useState({
    upcoming: 0,
    snoozed: 0,
    missed: 0,
    completed: 0,
  });

  // Load Categories & Initial Reminders
  useEffect(() => {
    if (userId) {
      loadCategories();
      loadStats();
    }
  }, [userId]);

  // Reload list on filter/page change
  useEffect(() => {
    if (userId) {
      loadReminders();
    }
  }, [userId, statusFilter, categoryFilter, priorityFilter, sortBy, sortDirection, page]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories/user");
      if (res.status === 200) {
        setCategories(res.data);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch some stats. We can run separate lightweight count queries or filter in-memory.
      // For now, let's load all active reminders to calculate stats dynamically.
      const res = await api.get("/v1/reminders?size=100");
      if (res.status === 200) {
        const list: Reminder[] = res.data.content || [];
        setStats({
          upcoming: list.filter(r => r.status === "UPCOMING" || r.status === "NOTIFIED").length,
          snoozed: list.filter(r => r.status === "SNOOZED").length,
          missed: list.filter(r => r.status === "MISSED").length,
          completed: list.filter(r => r.status === "COMPLETED").length,
        });
      }
    } catch (e) {
      console.error("Failed to load reminder stats:", e);
    }
  };

  const loadReminders = async () => {
    setLoading(true);
    try {
      let url = `/v1/reminders?page=${page}&size=${pageSize}&sortBy=${sortBy}&direction=${sortDirection}`;
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
      if (categoryFilter !== "ALL") url += `&categoryId=${categoryFilter}`;
      if (priorityFilter !== "ALL") url += `&priority=${priorityFilter}`;

      const res = await api.get(url);
      if (res.status === 200) {
        setReminders(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      toast.error("Failed to fetch reminders");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingReminder(null);
    setTitle("");
    setDescription("");
    setCategoryId(categories[0]?.id || "");
    
    // Set default dueAt to tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    // Format to YYYY-MM-DDThh:mm
    const tzoffset = tomorrow.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(tomorrow.getTime() - tzoffset)).toISOString().slice(0, 16);
    setDueAt(localISOTime);
    
    setAmount("");
    setCurrency(user.currency || "USD");
    setPriority("MEDIUM");
    setRepeatType("NONE");
    setDeliveryType("BOTH");
    setNotes("");
    setOffsets(["ONE_DAY"]);
    setSheetOpen(true);
  };

  const handleOpenEdit = async (reminder: Reminder) => {
    // Open sheet immediately and prefill with existing summary details
    setEditingReminder(reminder);
    setTitle(reminder.title);
    setDescription(reminder.description || "");
    setCategoryId(reminder.category?.id || "");
    
    const dateObj = new Date(reminder.dueAt);
    const tzoffset = dateObj.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0, 16);
    setDueAt(localISOTime);
    
    setAmount(reminder.amount ? reminder.amount.toString() : "");
    setCurrency(reminder.currency || "USD");
    setPriority(reminder.priority);
    setRepeatType(reminder.repeatType);
    setDeliveryType("BOTH");
    setNotes(reminder.notes || "");
    setOffsets(["ONE_DAY"]);
    
    setSheetOpen(true);
    setIsFetchingDetails(true);
    try {
      // Get detailed reminder settings (offsets, delivery type)
      const res = await api.get(`/v1/reminders/${reminder.id}`);
      if (res.status === 200) {
        const details = res.data;
        setEditingReminder(details);
        setTitle(details.title);
        setDescription(details.description || "");
        setCategoryId(details.category?.id || "");
        
        const dateObj = new Date(details.dueAt);
        const tzoffset = dateObj.getTimezoneOffset() * 60000; 
        const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0, 16);
        setDueAt(localISOTime);
        
        setAmount(details.amount ? details.amount.toString() : "");
        setCurrency(details.currency || "USD");
        setPriority(details.priority);
        setRepeatType(details.repeatType);
        setDeliveryType(details.deliveryType || "BOTH");
        setNotes(details.notes || "");
        setOffsets(details.notificationOffsets || ["ONE_DAY"]);
      }
    } catch (e) {
      toast.error("Failed to load reminder details");
      setSheetOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!dueAt) {
      toast.error("Due date is required");
      return;
    }
    if (offsets.length === 0) {
      toast.error("At least one notification offset is required");
      return;
    }
    if (amount && Number(amount) <= 0) {
      toast.error("Amount must be positive");
      return;
    }

    const payload = {
      title,
      description: description || null,
      dueAt: new Date(dueAt).toISOString(),
      categoryId,
      amount: amount ? parseFloat(amount) : null,
      currency,
      priority,
      repeatType,
      notificationOffsets: offsets,
      deliveryType,
      notes: notes || null,
    };

    setIsSaving(true);
    try {
      if (editingReminder) {
        await api.put(`/v1/reminders/${editingReminder.id}`, payload);
        toast.success("Reminder updated successfully");
      } else {
        await api.post("/v1/reminders", payload);
        toast.success("Reminder created successfully");
      }
      setSheetOpen(false);
      loadReminders();
      loadStats();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to save reminder";
      toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async (reminder: Reminder) => {
    try {
      await api.patch(`/v1/reminders/${reminder.id}/complete`);
      toast.success(`Completed "${reminder.title}"`);
      loadReminders();
      loadStats();
    } catch (e) {
      toast.error("Failed to mark reminder as completed");
    }
  };

  const handleOpenSnooze = (reminder: Reminder) => {
    setSnoozingReminder(reminder);
    setSnoozeDuration("30m");
    setCustomSnoozeDate("");
    setSnoozeOpen(true);
  };

  const handleSnoozeConfirm = async () => {
    if (!snoozingReminder) return;

    if (snoozeDuration === "custom" && !customSnoozeDate) {
      toast.error("Please pick a snooze date & time");
      return;
    }

    const payload = {
      duration: snoozeDuration,
      customSnoozedUntil: snoozeDuration === "custom" ? new Date(customSnoozeDate).toISOString() : null,
    };

    try {
      await api.patch(`/v1/reminders/${snoozingReminder.id}/snooze`, payload);
      toast.success(`Snoozed "${snoozingReminder.title}"`);
      setSnoozeOpen(false);
      loadReminders();
      loadStats();
    } catch (e) {
      toast.error("Failed to snooze reminder");
    }
  };

  const handleOpenDelete = (reminder: Reminder) => {
    setDeletingReminder(reminder);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReminder) return;

    try {
      await api.delete(`/v1/reminders/${deletingReminder.id}`);
      toast.success("Reminder deleted");
      setDeleteOpen(false);
      loadReminders();
      loadStats();
    } catch (e) {
      toast.error("Failed to delete reminder");
    }
  };

  const toggleOffset = (offsetVal: string) => {
    if (offsets.includes(offsetVal)) {
      setOffsets(offsets.filter(x => x !== offsetVal));
    } else {
      setOffsets([...offsets, offsetVal]);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
    setPage(0);
  };

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case "HIGH": return "bg-rose-500/15 text-rose-500 border-rose-500/20";
      case "MEDIUM": return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default: return "bg-blue-500/15 text-blue-500 border-blue-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "MISSED": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "SNOOZED": return "bg-violet-500/10 text-violet-500 border-violet-500/20";
      case "NOTIFIED": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const offsetOptions = [
    { value: "FIVE_MINUTES", label: "5 minutes" },
    { value: "THIRTY_MINUTES", label: "30 minutes" },
    { value: "ONE_HOUR", label: "1 hour" },
    { value: "ONE_DAY", label: "1 day" },
    { value: "THREE_DAYS", label: "3 days" },
    { value: "SEVEN_DAYS", label: "7 days" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Manage
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-2">
            Financial Reminders
          </h1>
          <p className="text-sm text-muted-foreground">
            Track bills, rents, loan EMIs and verify schedules ahead of time.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-500/10">
          <Plus className="mr-2 h-4 w-4" />
          Add Reminder
        </Button>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => { setStatusFilter(statusFilter === "UPCOMING" ? "ALL" : "UPCOMING"); setPage(0); }}
          className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
            statusFilter === "UPCOMING"
              ? "border-teal-500 bg-teal-500/10 dark:bg-teal-500/15 ring-2 ring-teal-500/20"
              : "border-teal-500/10 bg-background/50 backdrop-blur"
          }`}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Upcoming</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.upcoming}</h3>
            <div className="h-8 w-8 rounded-full bg-teal-500/15 text-teal-500 flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div
          onClick={() => { setStatusFilter(statusFilter === "SNOOZED" ? "ALL" : "SNOOZED"); setPage(0); }}
          className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
            statusFilter === "SNOOZED"
              ? "border-violet-500 bg-violet-500/10 dark:bg-violet-500/15 ring-2 ring-violet-500/20"
              : "border-violet-500/10 bg-background/50 backdrop-blur"
          }`}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Snoozed</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-violet-500">{stats.snoozed}</h3>
            <div className="h-8 w-8 rounded-full bg-violet-500/15 text-violet-500 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div
          onClick={() => { setStatusFilter(statusFilter === "MISSED" ? "ALL" : "MISSED"); setPage(0); }}
          className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
            statusFilter === "MISSED"
              ? "border-rose-500 bg-rose-500/10 dark:bg-rose-500/15 ring-2 ring-rose-500/20"
              : "border-rose-500/10 bg-background/50 backdrop-blur"
          }`}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Missed</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-rose-500">{stats.missed}</h3>
            <div className="h-8 w-8 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
        </div>
        <div
          onClick={() => { setStatusFilter(statusFilter === "COMPLETED" ? "ALL" : "COMPLETED"); setPage(0); }}
          className={`rounded-2xl border p-4 space-y-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
            statusFilter === "COMPLETED"
              ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 ring-2 ring-emerald-500/20"
              : "border-emerald-500/10 bg-background/50 backdrop-blur"
          }`}
        >
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-emerald-500">{stats.completed}</h3>
            <div className="h-8 w-8 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="rounded-2xl border bg-background/60 backdrop-blur-md p-4 space-y-3 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
                <SelectTrigger className="w-[140px] h-9 rounded-xl">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="NOTIFIED">Notified</SelectItem>
                  <SelectItem value="SNOOZED">Snoozed</SelectItem>
                  <SelectItem value="MISSED">Missed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); setPage(0); }}>
                <SelectTrigger className="w-[160px] h-9 rounded-xl">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-medium">Priority</Label>
              <Select value={priorityFilter} onValueChange={(val) => { setPriorityFilter(val); setPage(0); }}>
                <SelectTrigger className="w-[120px] h-9 rounded-xl">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 self-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("dueAt")}
              className={`rounded-xl h-9 px-3 ${sortBy === "dueAt" ? "border-teal-500/50 bg-teal-500/5 text-teal-600 dark:text-teal-400" : ""}`}
            >
              <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
              Due Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("priority")}
              className={`rounded-xl h-9 px-3 ${sortBy === "priority" ? "border-teal-500/50 bg-teal-500/5 text-teal-600 dark:text-teal-400" : ""}`}
            >
              <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
              Priority
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl border border-border"
              onClick={() => {
                loadReminders();
                loadStats();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl border animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center border rounded-3xl p-12 text-center bg-background/30 border-dashed border-border/80 min-h-[300px]">
          <div className="h-12 w-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-4 text-teal-500">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No reminders found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Try adjusting your filters, or create a new financial reminder to get started.
          </p>
          <Button onClick={handleOpenAdd} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
            Create First Reminder
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((reminder) => {
            const isCompleted = reminder.status === "COMPLETED";
            const isMissed = reminder.status === "MISSED";
            const dateStr = new Date(reminder.dueAt).toLocaleString();

            return (
              <div
                key={reminder.id}
                className={`group relative rounded-2xl border p-5 transition-all duration-300 ${
                  isCompleted 
                    ? "opacity-60 bg-muted/10 border-border/30 hover:opacity-80" 
                    : isMissed
                      ? "bg-rose-500/[0.02] border-rose-500/20 hover:border-rose-500/35 hover:bg-rose-500/[0.04]"
                      : "bg-card/45 hover:bg-card/70 hover:border-teal-500/30 border-border/40 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Top Row: Category & Badges */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <CategoryBadge
                      name={reminder.category?.name}
                      icon={reminder.category?.icon}
                      color={reminder.category?.color}
                      size="sm"
                    />
                    {reminder.repeatType !== "NONE" && (
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium bg-teal-500/10 dark:bg-teal-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <RefreshCw className="h-2.5 w-2.5" />
                        {reminder.repeatType}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[9px] font-medium border-border/40 tracking-wider ${getPriorityColor(reminder.priority)}`}>
                      {reminder.priority}
                    </Badge>
                    <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[9px] font-medium border-border/40 tracking-wider ${getStatusColor(reminder.status)}`}>
                      {reminder.status}
                    </Badge>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className={`text-base font-semibold tracking-tight text-foreground line-clamp-1 ${isCompleted ? "line-through text-muted-foreground/60" : ""}`}>
                      {reminder.title}
                    </h4>
                    {reminder.amount ? (
                      <span className="text-sm font-extrabold text-foreground whitespace-nowrap">
                        {reminder.currency || "USD"} {Number(reminder.amount).toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                  {reminder.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {reminder.description}
                    </p>
                  )}
                </div>

                {/* Footer Section: Date Info (Left) & Actions (Right) */}
                <div className="flex items-center justify-between pt-3.5 border-t border-border/20 text-xs">
                  {/* Left: Date / Time details */}
                  <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                    <span>{dateStr}</span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1">
                    {!isCompleted && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleComplete(reminder)}
                          className="h-8 px-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-600 rounded-lg text-[11px] font-medium transition-colors"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenSnooze(reminder)}
                          className="h-8 px-2 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:text-violet-600 rounded-lg text-[11px] font-medium transition-colors"
                        >
                          <Clock className="mr-1 h-3.5 w-3.5" />
                          Snooze
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(reminder)}
                      className="h-8 w-8 p-0 rounded-lg hover:bg-muted text-muted-foreground/75 hover:text-foreground transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenDelete(reminder)}
                      className="h-8 w-8 p-0 rounded-lg hover:bg-rose-500/10 text-muted-foreground/75 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-xl h-8"
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground font-medium px-2">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="rounded-xl h-8"
          >
            Next
          </Button>
        </div>
      )}

      {/* Snooze Presets Dialog */}
      <Dialog open={snoozeOpen} onOpenChange={setSnoozeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-500" />
              Snooze Reminder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Postpone Duration</Label>
              <Select value={snoozeDuration} onValueChange={setSnoozeDuration}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Pick duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10m">10 Minutes</SelectItem>
                  <SelectItem value="30m">30 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                  <SelectItem value="custom">Custom Date & Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {snoozeDuration === "custom" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-xs font-semibold">Snoozed Until</Label>
                <Input
                  type="datetime-local"
                  value={customSnoozeDate}
                  onChange={(e) => setCustomSnoozeDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-xl flex-1">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSnoozeConfirm} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl flex-1">
              Snooze
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Reminder
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the reminder <strong>"{deletingReminder?.title}"</strong>?
              This is a soft delete, but it will hide the reminder from the dashboard and cancel all notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Form Drawer (Sheet) for Add/Edit */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto space-y-6">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-foreground">
              {editingReminder ? "Edit Reminder" : "Add Reminder"}
            </SheetTitle>
          </SheetHeader>

          {isFetchingDetails ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Spinner className="h-8 w-8 text-teal-600 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading details...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4 px-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rent, Electricity Bill, Insurance"
                className="rounded-xl"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional summary"
                className="rounded-xl"
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name} ({c.type})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label htmlFor="dueAt" className="text-xs font-semibold">Due Date & Time *</Label>
              <Input
                id="dueAt"
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="amount" className="text-xs font-semibold">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Optional"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority & Repeat */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority *</Label>
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Repeat *</Label>
                <Select value={repeatType} onValueChange={(val: any) => setRepeatType(val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">One-time</SelectItem>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Delivery Type Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Notify me via *</Label>
              <Select value={deliveryType} onValueChange={(val: any) => setDeliveryType(val)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Delivery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_APP">In-App Notification only</SelectItem>
                  <SelectItem value="EMAIL">Email only</SelectItem>
                  <SelectItem value="BOTH">Both (In-App & Email)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notification Offsets */}
            <div className="space-y-2 border p-3 rounded-2xl bg-muted/20 border-border/60">
              <Label className="text-xs font-bold block mb-1">Notification Offsets *</Label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {offsetOptions.map(opt => {
                  const checked = offsets.includes(opt.value);
                  return (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-muted/40 rounded-lg">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleOffset(opt.value)}
                        className="rounded accent-teal-600 h-4 w-4"
                      />
                      <span>{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes/reminders"
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg mt-6 py-2.5 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin text-white" />}
              {editingReminder ? "Update Reminder" : "Create Reminder"}
            </Button>
          </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
