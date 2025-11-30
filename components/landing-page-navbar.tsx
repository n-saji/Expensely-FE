"use client";
import { useRouter } from "next/navigation";
import Logo from "./logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken from "@/utils/fetch_token";
import validateToken from "@/utils/validate_token";
import { setUser } from "@/redux/slices/userSlice";
import { useDispatch } from "react-redux";
import { Button } from "./ui/button";

export default function LandingPageNavBar() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);
  const [loggedIn, setLoggedIn] = useState(false);
  const token = FetchToken();
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      validateToken().then((isValid) => {
        if (isValid) {
          setLoggedIn(true);
          dispatch(setUser({ ...user, isAuthenticated: true }));
        } else {
          setLoggedIn(false);
          dispatch(setUser({ ...user, isAuthenticated: false }));
        }
      });
    }
  }, [token, dispatch, router]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow">
      <Logo
        className="text-xl sm:text-3xl font-bold"
        dimension={{ width: 30, height: 30 }}
      />
      <div>
        {loggedIn ? (
          <Link href="/dashboard" className="text-medium hover:underline">
            <Button variant={"ghost"}>Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link href="/login" className="text-medium hover:underline">
              <Button>Login</Button>
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-md text-sm">
              <Button variant={"outline"}>Register</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
