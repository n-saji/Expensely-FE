"use client";
import React, { useEffect, useRef } from "react";

import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";

import Link from "next/link";
import UserPreferences from "@/utils/userPreferences";
import Loader from "@/components/loader";
import FetchToken from "@/utils/fetch_token";
import { Toaster } from "@/components/ui/sonner";

import { addCategory, removeCategory } from "@/redux/slices/category";
import { CategoryTypeExpense } from "@/global/constants";
import { Category } from "@/global/dto";
import { useDispatch, useSelector } from "react-redux";
import { AppSidebar } from "@/components/sidebar";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

export default function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.user);
  const token = FetchToken();

  const router = useRouter();
  const loading = useSelector((state: RootState) => state.sidebar.loading);
  const isCategoryMounted = useRef(false);
  const categories = useSelector((state: RootState) => state.categoryExpense);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (isCategoryMounted.current) {
        console.log("Component is already mounted, skipping fetch");
        return;
      }
      isCategoryMounted.current = true;
      try {
        const response = await api.get(
          `/categories/user/${user.id}?type=${CategoryTypeExpense}`
        );

        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const data = response.data;
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid categories data");
        }
        data.forEach((category: Category) => {
          const alreadyExists = categories.categories.some(
            (c) => c.id === category.id
          );
          if (!alreadyExists) {
            dispatch(
              addCategory({
                id: category.id,
                type: category.type,
                name: category.name,
              })
            );
          }
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    dispatch(
      removeCategory({
        id: "",
        type: CategoryTypeExpense,
        name: "",
      })
    );
  }, []);

  const popUp = useSelector((state: RootState) => state.sidebar.popUpEnabled);

  useEffect(() => {
    document.body.style.overflow = popUp ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [popUp]);

  if (!user.isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl w-full">
        <h1 className="text-gray-700">Please log in to continue. </h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  if (user.profileComplete === false) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl">
        <h1 className="text-gray-700">
          Please complete your profile to continue.&nbsp;
        </h1>
        <button
          onClick={() => {
            router.push("/complete-profile");
          }}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          Complete Profile
        </button>
      </div>
    );
  }

  return (
    <>
      {loading && <Loader />}
      <Toaster closeButton />
      <div className={`w-full flex min-h-screen bg-background min-sm:relative`}>
        <AppSidebar />
        {/* <Sidebar /> */}

        <div className={`w-full transition-all duration-300 `}>
          <Navbar />
          <div className="px-8 py-8 flex flex-col space-y-4 w-full items-center overflow-auto min-h-full">
            {children}
          </div>
        </div>
        <UserPreferences />
      </div>
    </>
  );
}
