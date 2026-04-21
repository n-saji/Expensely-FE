"use client";
import React, { useEffect, useState } from "react";

import { RootState } from "@/redux/store";
import { usePathname, useRouter } from "next/navigation";

import Link from "next/link";
import UserPreferences from "@/utils/userPreferences";
import Loader from "@/components/loader";
import { Toaster } from "@/components/ui/sonner";

import { setCategories } from "@/redux/slices/categorySlice";
import { CategoryTypeExpense } from "@/global/constants";
import { Category } from "@/global/dto";
import { useDispatch, useSelector } from "react-redux";
import { clearUser, setUser } from "@/redux/slices/userSlice";
import { AppSidebar } from "@/components/sidebar";
import Navbar from "@/components/navbar";
import api from "@/lib/api";

import AlertComponent from "@/components/AlertComponent";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function DashboardPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.user);
  const path = usePathname();
  const router = useRouter();
  const loading = useSelector((state: RootState) => state.sidebar.loading);
  const dispatch = useDispatch();
  const [authResolved, setAuthResolved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useWebSocket(
    authResolved && isAuthenticated && user.notificationsEnabled
      ? user.id
      : null,
  );

  useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      // Redux is not persisted; on direct URL visits hydrate from cookie-backed API.
      if (user?.id) {
        if (active) {
          setIsAuthenticated(true);
          setAuthResolved(true);
        }
        return;
      }

      try {
        const response = await api.get(`/users/me`);

        if (!active) {
          return;
        }

        if (response.status !== 200 || !response.data?.user?.id) {
          setIsAuthenticated(false);
          dispatch(clearUser());
          return;
        }

        const profile = response.data.user;
        dispatch(
          setUser({
            email: profile.email,
            id: profile.id,
            name: profile.name,
            country_code: profile.country_code,
            phone: profile.phone,
            currency: profile.currency,
            theme: profile.theme,
            language: profile.language,
            isActive: profile.isActive,
            isAdmin: profile.isAdmin,
            notificationsEnabled: profile.notificationsEnabled,
            profilePicFilePath: profile.profilePicFilePath,
            profileComplete: profile.profileComplete,
            profilePictureUrl: profile.profilePictureUrl,
            emailVerified: profile.emailVerified,
          }),
        );

        setIsAuthenticated(true);
      } catch {
        if (!active) {
          return;
        }
        setIsAuthenticated(false);
        dispatch(clearUser());
      } finally {
        if (active) {
          setAuthResolved(true);
        }
      }
    };

    hydrateUser();

    return () => {
      active = false;
    };
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!authResolved || !isAuthenticated || !user?.id) {
      return;
    }

    if (user.emailVerified === false) {
      localStorage.setItem("pending_verify_user_id", user.id);
      localStorage.setItem("pending_verify_email", user.email || "");
      localStorage.setItem("otp_auto_resend", "1");
      router.push("/verify-otp");
    }
  }, [
    authResolved,
    isAuthenticated,
    router,
    user?.email,
    user?.emailVerified,
    user?.id,
  ]);

  useEffect(() => {
    if (!authResolved || !isAuthenticated || !user?.id) {
      return;
    }

    if (user.emailVerified === false) {
      return;
    }

    const fetchExpenseCategories = async () => {
      try {
        const response = await api.get(
          `/categories/user?type=${CategoryTypeExpense}`,
        );

        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }
        const data = response.data;
        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid categories data");
        }

        dispatch(
          setCategories(
            data.map((category: Category) => ({
              id: category.id,
              type: category.type,
              name: category.name,
            })),
          ),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchExpenseCategories();

    const handleCategoryAdded = () => {
      fetchExpenseCategories();
    };

    window.addEventListener("category-added", handleCategoryAdded);

    return () => {
      window.removeEventListener("category-added", handleCategoryAdded);
    };
  }, [authResolved, isAuthenticated, dispatch, user?.emailVerified, user?.id]);

  if (!authResolved) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl w-full">
        <h1 className="text-gray-700">Please log in to continue. </h1>
        <Link href="/login" className="text-blue-600 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  if (user.emailVerified === false) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader />
      </div>
    );
  }

  if (user.profileComplete === false) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl w-full">
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
      <div className="w-full flex min-sm:relative">
        <AppSidebar />
        {/* <Sidebar /> */}

        <div className="relative w-full min-h-screen transition-all duration-300">
          {/* <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_45%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.08),transparent_40%,rgba(14,116,144,0.08))] dark:bg-[linear-gradient(120deg,rgba(16,185,129,0.12),transparent_40%,rgba(14,116,144,0.12))]" />
          </div> */}

          <Navbar />

          {/* Alerts/Banners */}
          {path.includes("/dashboard") && <AlertComponent />}

          <div className="px-6 md:px-8 py-8 flex flex-col space-y-6 w-full items-center">
            <div className="w-full max-w-6xl">{children}</div>
          </div>
        </div>
        <UserPreferences />
      </div>
    </>
  );
}
