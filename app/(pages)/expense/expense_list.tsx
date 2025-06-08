"use client";
import { API_URL } from "@/config/config";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { currencyMapper } from "@/utils/currencyMapper";

interface Expense {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    // Add other user properties as needed
  };
  category: {
    id: string;
    name: string;
    // Add other category properties as needed
  };
  amount: number;
  description: string;
  expenseDate: string;
}

export default function ExpenseList() {
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();
  const isMounted = useRef(false);
  const [data, setData] = useState<Expense[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);

  useEffect(() => {
    // Fetch expenses data here
    const fetchExpenses = async () => {
      if (isMounted.current) {
        console.log("Component is already mounted, skipping fetch");
        return;
      }
      isMounted.current = true;
      try {
        const response = await fetch(`${API_URL}/expenses/user/${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Assuming user token is stored in state
          },
        }); // Adjust the endpoint as needed
        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }
        const data = await response.json();
        console.log(data); // Handle the fetched data
        setData(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, []);
  return (
    <div className="block w-full p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-500">
          Recent Transactions
        </h1>
        <div>
          <button
            className={`${
              selectedExpenses.length === 0 || selectedExpenses.length > 1
                ? "opacity-50 cursor-not-allowed"
                : ""
            } button-blue px-6 py-2`}
            disabled={
              selectedExpenses.length === 0 || selectedExpenses.length > 1
            }
          >
            Edit
          </button>
          <button
            className={`ml-4 button-delete px-6 py-2 ${
              selectedExpenses.length === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={selectedExpenses.length === 0}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 shadow-lg rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold ">#</th>
              <th className="px-4 py-3 font-semibold ">Category</th>
              <th className="px-4 py-3 font-semibold ">Amount</th>
              <th className="px-4 py-3 font-semibold ">Description</th>
              <th className="px-4 py-3 font-semibold ">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-sm">
            {data.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-100 py-3">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={selectedExpenses.includes(expense.id)}
                    onChange={() => {
                      if (selectedExpenses.includes(expense.id)) {
                        setSelectedExpenses(
                          selectedExpenses.filter((id) => id !== expense.id)
                        );
                      } else {
                        setSelectedExpenses([...selectedExpenses, expense.id]);
                      }
                    }}
                  />
                </td>
                <td className="px-4 py-3">{expense.category.name}</td>
                <td className="px-4 py-3 font-medium text-green-600">
                  {currencyMapper(user?.currency || "USD")}
                  {expense.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3">{expense.description}</td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(expense.expenseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
{
  /* */
}

// {
//   "id": "f56ed755-098d-4014-bdc1-a98340f7a83e",
//   "user": {
//     "id": "5c0ae527-da68-4da1-9714-f6a31edf009d",
//     "email": "nikhilsaji200@gmail.com",
//     "password": "$2a$10$5DwKsvKP4NQKkWtMZbLRr.3cSd/jmXmRmn7D7wlzOEi5NFR1nWM9q",
//     "name": "Nikhil Saji",
//     "country_code": "+1",
//     "phone": "7162393680",
//     "createdAt": "2025-06-05T01:25:12.679584",
//     "currency": "USD"
//   },
//   "category": {
//     "id": "04234629-6b47-4a9a-9b73-184131320487",
//     "user": {
//       "id": "5c0ae527-da68-4da1-9714-f6a31edf009d",
//       "email": "nikhilsaji200@gmail.com",
//       "password": "$2a$10$5DwKsvKP4NQKkWtMZbLRr.3cSd/jmXmRmn7D7wlzOEi5NFR1nWM9q",
//       "name": "Nikhil Saji",
//       "country_code": "+1",
//       "phone": "7162393680",
//       "createdAt": "2025-06-05T01:25:12.679584",
//       "currency": "USD"
//     },
//     "name": "Utilities",
//     "type": "expense"
//   },
//   "amount": 80,
//   "description": "Electricity Bill",
//   "expenseDate": "2025-06-05T00:00:00"
// }
