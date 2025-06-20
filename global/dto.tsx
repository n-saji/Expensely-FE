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
  user: {
    id: string;
  };
  name: string;
  type: string;
}


export interface UserSkeleton {
  email: string;
  isAuthenticated: boolean;
  id: string;
  name: string;
  country_code: string;
  phone: string;
  currency: string;
  theme: string;
  language: string;
  isActive: boolean;
  isAdmin: boolean;
  notificationsEnabled: boolean;
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
  comparedToLastMonthExpense: number;
  categoryCount: Record<string, number>;
  averageMonthlyExpense: number;
  topFiveMostExpensiveItemThisMonth: Record<string, number>;
  monthlyCategoryExpense: Record<string, Record<string, number>>;
}

export interface DashboardPageProps {
  userId: string;
  token: string | null;
  user: UserSkeleton;
  overview: ExpenseOverview | null;
}