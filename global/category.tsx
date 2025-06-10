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
