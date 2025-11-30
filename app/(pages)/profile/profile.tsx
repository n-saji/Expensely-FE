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
import { useRouter } from "next/navigation";
import PopUp from "@/components/pop-up";
import { togglePopUp } from "@/redux/slices/sidebarSlice";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function ProfilePage({
  reRouteToDashboard,
}: {
  reRouteToDashboard?: boolean;
}) {
  const [error, setError] = useState("");
  const [loading, setLoadingLocal] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("");
  const togglePopup = useSelector(
    (state: RootState) => state.sidebar.popUpEnabled
  );

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
  const router = useRouter();

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

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

    const isProfileComplete =
      name !== "" && email !== "" && countryCode !== "" && phone !== "";

    setLoadingLocal(true);
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
        profileComplete: isProfileComplete,
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
            profileComplete: isProfileComplete,
          })
        );

        if (reRouteToDashboard && isProfileComplete) {
          router.push("/dashboard");
          return null;
        }
      })
      .catch((error) => {
        setError(`Error updating profile: ${error}`);
        setEdit(true);
      })
      .finally(() => {
        setLoadingLocal(false);
      });
  };

  const removeProfilePicture = async () => {
    if (!user.profilePicFilePath) {
      console.error("No profile picture to remove.");
      return;
    }
    try {
      setImageLoading(true);
      const { error: deleteError } = await supabase.storage
        .from("profiles-expensely")
        .remove([user.profilePicFilePath]);

      if (deleteError) {
        console.error("Delete Error:", deleteError.message);
        return;
      }

      const response = await fetch(
        `${API_URL}/users/${userId}/update-profile-picture?filepath=${""}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imageUrl: "" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile picture in backend.");
      }

      dispatch(
        setUser({
          ...user,
          profilePictureUrl: "",
          profilePicFilePath: "",
        })
      );
    } catch (err) {
      console.error("Error removing profile picture:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    let signedUrl = "";

    try {
      setImageLoading(true);
      if (user.profilePicFilePath) {
        const { error: deleteError } = await supabase.storage
          .from("profiles-expensely")
          .remove([user.profilePicFilePath]);
        if (deleteError) {
          console.error("Delete Error:", deleteError.message);
          return;
        }
      }

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
    } catch (err) {
      console.error("Error during upload:", err);
    } finally {
      setImageLoading(false);
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
    <Card className="min-w-1/2 max-md:w-2/3 max-sm:w-96 p-8 max-sm:p-6 flex flex-col items-center relative">
      <div
        className="relative w-[200px] h-[200px] rounded-full mb-4  text-center
      "
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
          className="absolute bottom-0 right-5 p-1 rounded-full 
          cursor-pointer hover:bg-white/40 dark:hover:bg-gray-800/40 transition-all duration-200
          "
          onClick={() => dispatch(togglePopUp())}
        />
        {togglePopup && (
          <PopUp title="Profile Picture">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-gray-200 text-sm text-left">
                A picture helps people recognize you and lets you know when
                you’re signed in to your account
              </p>
              <label
                className={`button-gray w-full py-2
                ${imageLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];

                      await handleImageUpload(file);
                      dispatch(togglePopUp());
                    }
                  }}
                />
                {user.profilePictureUrl
                  ? "📷 Change Profile Picture"
                  : "📷 Add Profile Picture"}
              </label>
              {user.profilePictureUrl && (
                <button
                  className={`button-delete w-full py-2
                    ${imageLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={async () => {
                    await removeProfilePicture();
                    dispatch(togglePopUp());
                  }}
                >
                  Remove Profile Picture
                </button>
              )}
            </div>
          </PopUp>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-2xl font-semibold ">{user.name}</h2>
        <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent
          className="flex flex-col max-sm:gap-3 min-md:gap-4 w-full
                "
        >
          <div className="grid_input">
            <Label htmlFor="fullName">Full Name</Label>
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
            <Label htmlFor="emailAddress">Email</Label>
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
            <Label htmlFor="countryCode">Country Code</Label>

            <p className="text-gray-500 dark:text-gray-400">
              {edit ? (
                <input
                  type="text"
                  className="edit_input"
                  value={countryCode || ""}
                  onChange={(e) => setCountryCode(e.target.value)}
                />
              ) : (
                countryCode
              )}
            </p>
          </div>
          <div className="grid_input">
            <Label htmlFor="phoneNumber">Phone</Label>
            <p className="text-gray-500 dark:text-gray-400">
              {edit ? (
                <input
                  type="text"
                  className="edit_input"
                  value={phone || ""}
                  onChange={(e) => setPhone(e.target.value)}
                />
              ) : (
                phone
              )}
            </p>
          </div>
          <div className="grid_input">
            <Label htmlFor="currency">Currency</Label>
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
        </CardContent>
      </Card>
      <CardFooter className="w-full flex justify-end">
        <Button
          variant={edit ? "default" : loading ? "ghost" : "outline"}
          onClick={() => {
            setEdit(!edit);
            if (edit) {
              handleProfileUpdate();
            }
          }}
          disabled={loading}
        >
          {edit ? "Save" : loading ? <Spinner /> : "Edit"}
        </Button>
      </CardFooter>
      {error && <div className="text-red-500 mt-4 text-sm">{error}</div>}
    </Card>
  );
}
