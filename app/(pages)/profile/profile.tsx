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
import { setPopUp } from "@/redux/slices/sidebarSlice";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import { Mail, Phone, UserRound, Upload } from "lucide-react";

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
  const [initialProfile, setInitialProfile] = useState({
    name: "",
    email: "",
    countryCode: "",
    phone: "",
    currency: "",
  });
  const togglePopup = useSelector(
    (state: RootState) => state.sidebar.popUpEnabled,
  );

  const hasFetchedRef = useRef(false);

  const syncProfileFields = (profile: {
    name?: string;
    email?: string;
    country_code?: string;
    phone?: string;
    currency?: string;
  }) => {
    const currentValues = {
      name: profile.name ?? "",
      email: profile.email ?? "",
      countryCode: profile.country_code ?? "",
      phone: profile.phone ?? "",
      currency: profile.currency ?? "",
    };

    setName(currentValues.name);
    setEmail(currentValues.email);
    setCountryCode(currentValues.countryCode);
    setPhone(currentValues.phone);
    setCurrency(currentValues.currency);
    setInitialProfile(currentValues);
  };

  useEffect(() => {
    syncProfileFields(user);
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
        syncProfileFields(data.user);
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
        setInitialProfile({
          name,
          email,
          countryCode,
          phone,
          currency,
        });
        setEdit(false);

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

  const handleCancelEdit = () => {
    setName(initialProfile.name);
    setEmail(initialProfile.email);
    setCountryCode(initialProfile.countryCode);
    setPhone(initialProfile.phone);
    setCurrency(initialProfile.currency);
    setError("");
    setEdit(false);
  };

  return (
    <div className="relative w-full px-4 py-8 md:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="h-fit overflow-hidden border-border/70 shadow-sm">
          <div className="h-20 w-full" />
          <CardHeader className="-mt-10 flex flex-col items-center gap-3">
            <div className="relative h-[150px] w-[150px] rounded-full ring-4 ring-background">
              <Image
                alt="Profile Picture"
                src={
                  user.profilePictureUrl ? user.profilePictureUrl : defaultPNG
                }
                fill
                className="rounded-full border border-border/70 object-cover"
              />
              <button
                type="button"
                className="absolute bottom-1 right-1 rounded-full border border-border/70 bg-background p-2 shadow-sm transition-colors hover:bg-muted"
                onClick={() => dispatch(setPopUp(true))}
              >
                <Image
                  alt="Edit Icon"
                  src={user.theme === "light" ? editIcon : editIconWhite}
                  width={16}
                  height={16}
                />
              </button>
              {togglePopup && (
                <Dialog
                  open={togglePopup}
                  onOpenChange={(open) => dispatch(setPopUp(open))}
                >
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Profile Picture</DialogTitle>
                      <DialogDescription>
                        A picture helps people recognize you and lets you know
                        when you’re signed in to your account.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="w-full"
                        disabled={imageLoading}
                      >
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={imageLoading}
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                await handleImageUpload(file);
                                dispatch(setPopUp(false));
                              }
                            }}
                          />
                          {imageLoading ? (
                            <>
                              <Spinner /> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="size-4" />
                              {user.profilePictureUrl
                                ? "Change Profile Picture"
                                : "Add Profile Picture"}
                            </>
                          )}
                        </label>
                      </Button>
                    </div>

                    <DialogFooter className="sm:justify-between">
                      {user.profilePictureUrl ? (
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            await removeProfilePicture();
                            dispatch(setPopUp(false));
                          }}
                          disabled={imageLoading}
                        >
                          {imageLoading ? (
                            <>
                              <Spinner /> Removing...
                            </>
                          ) : (
                            "Remove Picture"
                          )}
                        </Button>
                      ) : (
                        <div />
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => dispatch(setPopUp(false))}
                        disabled={imageLoading}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="space-y-1 text-center">
              <CardTitle className="text-xl">
                {user.name || "Unnamed User"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {user.email || "No email"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="secondary">
                <UserRound className="size-3.5" />
                Profile
              </Badge>
              <Badge variant={user.profileComplete ? "default" : "outline"}>
                {user.profileComplete ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
              <span className="text-muted-foreground">Country Code</span>
              <span className="font-medium text-foreground">
                {countryCode || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
              <span>Currency</span>
              <span className="font-medium text-foreground">
                {currency || "-"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
              <span>Phone</span>
              <span className="font-medium text-foreground">
                {phone || "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardHeader className="space-y-1 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-xl">Profile Details</CardTitle>
            <p className="text-sm text-muted-foreground">
              Keep your personal information up to date.
            </p>
          </CardHeader>
          <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-muted-foreground">
                Full Name
              </Label>
              {edit ? (
                <Input
                  id="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              ) : (
                <div className="flex h-10 items-center gap-2 rounded-md border border-border/70 bg-background px-3">
                  <UserRound className="size-4 text-muted-foreground" />
                  <span>{name || "-"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailAddress" className="text-muted-foreground">
                Email
              </Label>
              {edit ? (
                <Input
                  id="emailAddress"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              ) : (
                <div className="flex h-10 items-center gap-2 rounded-md border border-border/70 bg-background px-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{email || "-"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryCode" className="text-muted-foreground">
                Country Code
              </Label>
              {edit ? (
                <Input
                  id="countryCode"
                  value={countryCode || ""}
                  onChange={(e) => setCountryCode(e.target.value)}
                />
              ) : (
                <div className="flex h-10 items-center rounded-md border border-border/70 bg-background px-3">
                  <span>{countryCode || "-"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-muted-foreground">
                Phone
              </Label>
              {edit ? (
                <Input
                  id="phoneNumber"
                  value={phone || ""}
                  onChange={(e) => setPhone(e.target.value)}
                />
              ) : (
                <div className="flex h-10 items-center gap-2 rounded-md border border-border/70 bg-background px-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{phone || "-"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currency" className="text-muted-foreground">
                Preferred Currency
              </Label>
              {edit ? (
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              ) : (
                <div className="flex h-10 items-center rounded-md border border-border/70 bg-background px-3">
                  <span>{currency || "-"}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-t border-border/60 bg-muted/10 py-4 md:flex-row md:items-center">
            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {edit ? "Review details before saving." : ""}
              </div>
            )}

            <div className="flex items-center gap-2 self-end md:self-auto">
              {edit && (
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant={edit ? "default" : "outline"}
                onClick={() => {
                  if (edit) {
                    handleProfileUpdate();
                    return;
                  }
                  setEdit(true);
                }}
                disabled={loading || imageLoading}
              >
                {loading ? (
                  <>
                    <Spinner /> Saving...
                  </>
                ) : edit ? (
                  "Save Changes"
                ) : (
                  <>Edit Profile</>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
