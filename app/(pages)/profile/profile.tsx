"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import FetchToken, { FetchUserId } from "@/utils/fetch_token";
import { API_URL } from "@/config/config";
import { setUser } from "@/redux/slices/userSlice";
import editIcon from "@/assets/icon/edit.png";
import editIconWhite from "@/assets/icon/edit-white.png";
import { supabase } from "@/utils/supabase";
import defaultPNG from "@/assets/icon/user.png";
import fetchProfileUrl from "@/utils/fetchProfileURl";

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
  const [editImage, setEditImage] = useState(false);

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

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    console.log("Fetching user profile data...");

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
            ...user,
            email: data.user.email,
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
        setName(data.user.name);
        setEmail(data.user.email);
        setCountryCode(data.user.country_code);
        setPhone(data.user.phone);
        setCurrency(data.user.currency);
        setError("");
      } else {
        setError("Failed to fetch user profile data.");
      }
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
            ...user,
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

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    let signedUrl = "";

    try {
      if (user.profilePicFilePath) {
        console.log("Deleting old image from Supabase Storage...");
        const { error: deleteError } = await supabase.storage
          .from("profiles-expensely")
          .remove([user.profilePicFilePath]);
        if (deleteError) {
          console.error("Delete Error:", deleteError.message);
          return;
        }
      }

      console.log("Uploading image to Supabase Storage...");
      const { error: uploadError } = await supabase.storage
        .from("profiles-expensely")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError.message);
        return;
      }

      await fetchProfileUrl(filePath)
        .then((url) => {
          signedUrl = url;
          console.log("Uploaded image Signed URL:", signedUrl);
        })
        .catch((err) => {
          console.error("Error fetching signed URL:", err);
          throw new Error("Failed to fetch signed URL for profile picture");
        });

      const response = await fetch(
        `${API_URL}/users/${userId}/update-profile-picture?filepath=${filePath}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageUrl: signedUrl }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile picture in backend.");
      }

      console.log("Profile picture URL saved to backend.");
    } catch (err) {
      console.error("Error during upload:", err);
    }

    dispatch(
      setUser({
        ...user,
        profilePictureUrl: `${signedUrl}`,
        profilePicFilePath: filePath,
      })
    );
  };

  return (
    <div className="min-w-1/2 max-md:w-2/3 max-sm:w-96 bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-sm:p-6 flex flex-col items-center relative">
      <div
        className="relative w-[150px] h-[150px] rounded-full mb-4 bg-gray-300 text-center 
      dark:bg-gray-700 dark:text-gray-200"
      >
        <Image
          alt="Profile Picture"
          src={user.profilePictureUrl ? user.profilePictureUrl : defaultPNG}
          fill
          className="object-cover rounded-full"
        />
        <Image
          alt="Edit Icon"
          src={user.theme === "light" ? editIcon : editIconWhite}
          width={30}
          height={30}
          className="absolute bottom-0 right-2  p-1 rounded-full 
          bg-white dark:bg-gray-800
          cursor-pointer hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all duration-200
          "
          onClick={() => setEditImage(!editImage)}
        />
        {editImage && (
          <div
            className="absolute top-full left-full w-25 h-10 bg-gray-800/50 dark:bg-gray-700/50
            flex items-center justify-center rounded-md"
          >
            <label className="text-gray-200 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];

                    console.log("Selected file:", file);
                    handleImageUpload(file);
                    setEditImage(false);
                  }
                }}
              />
              <span className="text-xs">Change Profile Picture</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {user.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 w-full mt-4 flex justify-center flex-col items-center space-y-2 p-4 rounded-lg">
        <div className="w-full flex items-start border-b border-gray-300 dark:border-gray-600 pb-2 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 block text-left">
            Profile
          </h1>
        </div>
        <div
          className="flex flex-col max-sm:gap-3 min-md:gap-4 w-full
                "
        >
          <div className="grid_input">
            <p className="font-semibold text-gray-600 dark:text-gray-300">
              Full Name
            </p>
            <p className="text-gray-500 dark:text-gray-400">
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
            <p className="font-semibold text-gray-600 dark:text-gray-300">
              Email
            </p>
            <p className="text-gray-500 dark:text-gray-400">
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
            <p className="font-semibold text-gray-600 dark:text-gray-300">
              Country Code
            </p>
            <p className="text-gray-500 dark:text-gray-400">
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
            <p className="font-semibold text-gray-600 dark:text-gray-300">
              Phone
            </p>
            <p className="text-gray-500 dark:text-gray-400">
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
            <p className="font-semibold text-gray-600 dark:text-gray-300">
              Currency
            </p>
            <p className="text-gray-500 dark:text-gray-400">
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
            className={`${edit ? "button-green px-3 py-1" : "button-gray px-3 py-1"}
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
              w-20
              `}
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
