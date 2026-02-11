"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FetchUserId } from "@/utils/fetch_token";
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
import api from "@/lib/api";

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
    (state: RootState) => state.sidebar.popUpEnabled,
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
  const router = useRouter();

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchData = async () => {
      const response = await api.get(`/users/${userId}`);
      if (response.status === 200) {
        const data = await response.data;
        dispatch(
          setUser({
            ...user,
            email: data.user.email,
            name: data.user.name,
            country_code: data.user.country_code,
            phone: data.user.phone,
            currency: data.user.currency,
          }),
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

    await api
      .patch(`/users/update-profile`, {
        name,
        email,
        country_code: countryCode,
        phone,
        currency,
        id: userId,
        profileComplete: isProfileComplete,
      })

      .then((response) => {
        if (response.status !== 200) {
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
          }),
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

      const response = await api.patch(
        `/users/${userId}/update-profile-picture?filepath=${""}`,
        { imageUrl: "" },
      );

      if (response.status !== 200) {
        throw new Error("Failed to update profile picture in backend.");
      }

      dispatch(
        setUser({
          ...user,
          profilePictureUrl: "",
          profilePicFilePath: "",
        }),
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

      const response = await api.patch(
        `/users/${userId}/update-profile-picture?filepath=${filePath}`,

        { imageUrl: signedUrl },
      );

      if (response.status !== 200) {
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
      }),
    );
  };
  return (
    <div className="relative w-full px-4 md:px-8 py-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.08),transparent_40%,rgba(14,116,144,0.08))] dark:bg-[linear-gradient(120deg,rgba(16,185,129,0.12),transparent_40%,rgba(14,116,144,0.12))]" />
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative w-[180px] h-[180px] rounded-full">
              <Image
                alt="Profile Picture"
                src={
                  user.profilePictureUrl ? user.profilePictureUrl : defaultPNG
                }
                fill
                className="object-cover rounded-full border border-border/70"
              />
              <button
                type="button"
                className="absolute -bottom-2 right-3 rounded-full border border-border/70 bg-background/90 p-2 shadow-sm hover:bg-muted/70 transition-colors"
                onClick={() => dispatch(togglePopUp())}
              >
                <Image
                  alt="Edit Icon"
                  src={user.theme === "light" ? editIcon : editIconWhite}
                  width={18}
                  height={18}
                />
              </button>
              {togglePopup && (
                <PopUp title="Profile Picture">
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-gray-200 text-sm text-left">
                      A picture helps people recognize you and lets you know
                      when you’re signed in to your account
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

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {user.name}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="grid w-full gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3 py-2">
                <span>Currency</span>
                <span className="text-foreground font-medium">
                  {currency || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3 py-2">
                <span>Phone</span>
                <span className="text-foreground font-medium">
                  {phone || "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10">
            <CardTitle>Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid_input">
              <Label htmlFor="fullName">Full Name</Label>
              <p className="text-gray-500 dark:text-gray-400">
                {edit ? (
                  <input
                    type="text"
                    className="edit_input"
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
          <CardFooter className="flex flex-col gap-3 items-end">
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
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
