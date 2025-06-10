"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken, { FetchUserId } from "@/utils/fetch_token";
import { API_URL } from "@/config/config";
import { setUser } from "@/redux/slices/userSlice";

export default function ProfilePage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("");

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setCountryCode(user.country_code);
    setPhone(user.phone);
    setCurrency(user.currency);
  }, [user]);

  const dispatch = useDispatch();
  const userId = FetchUserId();
  const token = FetchToken();

  async function fetchUser(userId: string): Promise<any> {
    const token = FetchToken();
    const fetchData = async () => {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        dispatch(
          setUser({
            email: data.user.email,
            id: data.user.id,
            name: data.user.name,
            country_code: data.user.country_code,
            phone: data.user.phone,
            currency: data.user.currency,
            theme: data.user.theme,
            language: data.user.language,
            isActive: data.user.isActive,
            isAdmin: data.user.isAdmin,
            notificationsEnabled: data.user.notificationsEnabled,
          })
        );
        return data;
      }
    };
    fetchData();
  }

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      await fetchUser(user.id).then((data) => {
        if (data) {
          setName(data.user.name);
          setEmail(data.user.email);
          setCountryCode(data.user.country_code);
          setPhone(data.user.phone);
          setCurrency(data.user.currency);
        }
      });
    };
    fetchData();
  }, []);

  const handleProfileUpdate = async () => {
    if (!name || !email || !countryCode || !phone || !currency) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    await fetch(`${API_URL}/users/update-profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        country_code: countryCode,
        phone,
        currency,
        id: userId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update profile.");
        }
        dispatch(
          setUser({
            email: email,
            name: name,
            country_code: countryCode,
            phone: phone,
            currency: currency,
            id: userId,
            theme: user.theme,
            language: user.language,
            isActive: user.isActive,
            isAdmin: user.isAdmin,
            notificationsEnabled: user.notificationsEnabled,
          })
        );
      })
      .catch((error) => {
        setError(`Error updating profile: ${error}`);
        setEdit(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-w-1/2 max-md:w-2/3 max-sm:w-80 bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-sm:p-6 flex flex-col items-center relative">
      <Image
        alt="Profile Picture"
        src="/path/to/profile-picture.jpg"
        width={150}
        height={150}
        className="rounded-full mb-4 bg-gray-300 text-center dark:bg-gray-700 dark:text-gray-200"
      />
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {user.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 w-full mt-4 flex justify-center flex-col items-center space-y-2 p-4 rounded-lg">
        <div className="w-full flex items-start">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 block text-left">
            Profile
          </h1>
        </div>
        <div
          className="flex flex-col max-sm:gap-3 min-md:gap-4 w-full
                "
        >
          <div className="grid_input">
            <p className="font-semibold">Full Name</p>
            <p className="text-gray-600 dark:text-gray-300">
              {edit ? (
                <input
                  type="text"
                  className="edit_input "
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                name
              )}
            </p>
          </div>
          <div className="grid_input">
            <p className="font-semibold">Email</p>
            <p>
              {edit ? (
                <input
                  type="email"
                  className="edit_input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              ) : (
                email
              )}
            </p>
          </div>
          <div className="grid_input">
            <p className="font-semibold">Country Code</p>
            <p>
              {edit ? (
                <input
                  type="text"
                  className="edit_input"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                />
              ) : (
                countryCode
              )}
            </p>
          </div>
          <div className="grid_input">
            <p className="font-semibold">Phone</p>
            <p>
              {edit ? (
                <input
                  type="text"
                  className="edit_input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              ) : (
                phone
              )}
            </p>
          </div>
          <div className="grid_input">
            <p className="font-semibold">Currency</p>
            <p>
              {edit ? (
                <input
                  type="text"
                  className="edit_input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              ) : (
                currency
              )}
            </p>
          </div>
        </div>
        <div className="w-full flex justify-end mt-4">
          <button
            className={`${edit ? "button-green" : "button-green-outline"}`}
            onClick={() => {
              setEdit(!edit);
              if (edit) {
                handleProfileUpdate();
              }
            }}
            disabled={loading}
          >
            {edit ? "Save" : loading ? "Saving..." : "Edit"}
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
    </div>
  );
}
