export const categoryTypes = [
  {
    label: "Expense",
    value: "expense",
  },
  {
    label: "Income",
    value: "income",
  },
  {
    label: "Investment",
    value: "investment",
  },
  {
    label: "Savings",
    value: "savings",
  },
  {
    label: "Debt",
    value: "debt",
  },
  {
    label: "Other",
    value: "other",
  },
];

export interface categorySkeleton {
  id: string;
  user?: {
    id: string;
  };
  name?: string;
  type?: string;
}

export interface UserSkeleton {
  email?: string;
  isAuthenticated?: boolean;
  id: string;
  name?: string;
  country_code?: string;
  phone?: string;
  currency?: string;
  theme?: string;
  language?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  notificationsEnabled?: boolean;
}

export interface ExpenseOverview {
  userId: string;
  totalAmount: number;
  totalCount: number;
  amountByCategory: Record<string, number>;
  amountByMonth: Record<string, number>;
  mostFrequentCategory: string;
  totalCategories: number;
  mostFrequentCategoryCount: number;
  thisMonthTotalExpense: number;
  lastMonthTotalExpense: number;
  categoryCount: Record<string, number>;
  averageMonthlyExpense: number;
  topFiveMostExpensiveItemThisMonth: Record<string, number>;
  monthlyCategoryExpense: Record<string, Record<string, number>>;
  overTheDaysThisMonth: Record<string, number>;
  earliestStartMonth: number;
  earliestStartYear: number;
  thisMonthMostExpensiveItem: Record<string, number>;
  budgetServiceMap: Record<string, Budget>;
}
export interface ExpenseOverviewV2 {
  amountByMonthV2: Record<string, number>;
  monthlyCategoryExpenseV2: Record<string, Record<string, number>>;
}

export interface DashboardPageProps {
  userId: string;
  token: string | null;
  user: UserSkeleton;
  overview: ExpenseOverview | null;
}

export interface BudgetReq {
  user: UserSkeleton;
  category: categorySkeleton;
  amountLimit: number;
  period: Period;
  startDate: string;
  endDate: string;
}

export enum Period {
  Weekly = "WEEKLY",
  Monthly = "MONTHLY",
  Yearly = "YEARLY",
  Custom = "CUSTOM",
}

export interface Category {
  id: string;
  type: string;
  name: string;
}

export interface Budget {
  id: string;
  user: UserSkeleton;
  category: Category;
  amountLimit: number;
  amountSpent: number;
  period: Period;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertDto {
  message: string;
  type: "INFO" | "WARNING" | "CRITICAL" | "success";
}

export interface BulkLoadResponse {
  valid: boolean;
  error: string | null;
  validationId: string | null;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export enum OverviewEnum {
  MONTH = "MONTH",
  YEAR = "YEAR",
  ALL_TIME = "ALL_TIME",
}
