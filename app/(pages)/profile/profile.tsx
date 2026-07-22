"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
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
import { Mail, Phone, UserRound, Upload, Globe, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { TOP_100_COUNTRY_CODES } from "@/app/(auth)/register/register_form_constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";


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
  const [initialProfile, setInitialProfile] = useState({
    name: "",
    email: "",
    countryCode: "",
    phone: "",
  });


  const countryCodeOptions = useMemo(
    () =>
      TOP_100_COUNTRY_CODES.map((option, index) => ({
        ...option,
        id: `${option.value}-${index}`,
      })).sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const [selectedCountryOptionId, setSelectedCountryOptionId] = useState("");

  useEffect(() => {
    if (countryCodeOptions.length > 0 && countryCode) {
      const match = countryCodeOptions.find((o) => o.value === countryCode);
      if (match) {
        setSelectedCountryOptionId(match.id);
      }
    }
  }, [countryCode, countryCodeOptions]);
  const togglePopup = useSelector(
    (state: RootState) => state.sidebar.popUpEnabled,
  );

  const hasFetchedRef = useRef(false);

  const syncProfileFields = (profile: {
    name?: string;
    email?: string;
    country_code?: string;
    phone?: string;
  }) => {
    const currentValues = {
      name: profile.name ?? "",
      email: profile.email ?? "",
      countryCode: profile.country_code ?? "",
      phone: profile.phone ?? "",
    };

    setName(currentValues.name);
    setEmail(currentValues.email);
    setCountryCode(currentValues.countryCode);
    setPhone(currentValues.phone);
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
      const response = await api.get(`/users/me`);
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
    if (!name || !email || !countryCode || !phone) {
      setError("All fields are required.");
      return;
    }

    setLoadingLocal(true);
    setError("");

    try {
      // 1. Phone validation (only if phone is changed)
      if (phone !== initialProfile.phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        const phoneCheck = await api.get(`/users/check/phone/${cleanPhone}`);
        if (phoneCheck.data === true) {
          setError("This phone number is already registered.");
          setLoadingLocal(false);
          return;
        }
      }

      // 2. Email validation (only if email is changed)
      if (email !== initialProfile.email) {
        const emailCheck = await api.get(`/users/check/email/${email}`);
        if (emailCheck.data === true) {
          setError("This email is already registered.");
          setLoadingLocal(false);
          return;
        }
      }

      const isProfileComplete =
        name !== "" && email !== "" && countryCode !== "" && phone !== "";

      const response = await api.patch(`/users/update-profile`, {
        name,
        email,
        country_code: countryCode,
        phone,
        id: userId,
        profileComplete: isProfileComplete,
      });

      if (response.status !== 200) {
        throw new Error("Failed to update profile.");
      }

      const isEmailUpdated = email !== initialProfile.email;
      const responseMessage = response.data?.message || "";

      if (isEmailUpdated && (responseMessage.includes("Verification OTP sent") || responseMessage.toLowerCase().includes("verification otp sent"))) {
        localStorage.setItem("pending_verify_user_id", userId || user.id || "");
        localStorage.setItem("pending_verify_email", email);
        localStorage.setItem("otp_auto_resend", "1");

        toast.success("Verification OTP sent! Redirecting in 3 seconds...");

        setTimeout(() => {
          dispatch(
            setUser({
              ...user,
              email: email,
              name: name,
              country_code: countryCode,
              phone: phone,
              id: userId ?? user.id,
              profileComplete: isProfileComplete,
              emailVerified: false,
            }),
          );
          setInitialProfile({
            name,
            email,
            countryCode,
            phone,
          });
          setEdit(false);
          router.push("/verify-otp");
        }, 3000);

        setLoadingLocal(false);
        return;
      }

      dispatch(
        setUser({
          ...user,
          email: email,
          name: name,
          country_code: countryCode,
          phone: phone,
          id: userId ?? user.id,
          profileComplete: isProfileComplete,
        }),
      );
      setInitialProfile({
        name,
        email,
        countryCode,
        phone,
      });
      setEdit(false);

      if (reRouteToDashboard && isProfileComplete) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(`Something went wrong. Please try again`);
      console.error("Profile Update Error:", err);
      setEdit(true);
    } finally {
      setLoadingLocal(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!user.profilePicFilePath) {
      console.error("No profile picture to remove.");
      return;
    }
    try {
      setImageLoading(true);
      const response = await api.patch(
        `/users/${userId}/update-profile-picture?filepath=`,
        { imageUrl: "" }
      );

      if (response.status !== 200) {
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

    try {
      setImageLoading(true);
      const presignedRes = await api.get(
        `/users/get-profile-presigned-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
      );

      const { url, key } = presignedRes.data;

      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to S3");
      }

      const response = await api.patch(
        `/users/${userId}/update-profile-picture?filepath=${encodeURIComponent(key)}`
      );

      if (response.status !== 200) {
        throw new Error("Failed to update profile picture in backend.");
      }

      const updatedUser = response.data?.user || response.data;
      const publicUrl = updatedUser?.profilePictureUrl || `https://expensely-profiles.s3.us-east-2.amazonaws.com/${key}`;

      dispatch(
        setUser({
          ...user,
          profilePictureUrl: publicUrl,
          profilePicFilePath: key,
        })
      );
    } catch (err) {
      console.error("Error during profile picture upload:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(initialProfile.name);
    setEmail(initialProfile.email);
    setCountryCode(initialProfile.countryCode);
    setPhone(initialProfile.phone);
    setError("");
    setEdit(false);
  };

  return (
    <div className="relative w-full space-y-6 py-2">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        {/* Soft Background Accent Gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/5 dark:to-transparent" />
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
            {/* Avatar Section */}
            <div className="relative h-24 w-24 rounded-full ring-4 ring-primary/20 shadow-md transition-transform duration-300 hover:scale-102">
              <Image
                alt="Profile Picture"
                src={user.profilePictureUrl ? user.profilePictureUrl : defaultPNG}
                fill
                className="rounded-full border border-border/70 object-cover"
                unoptimized
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 rounded-full border border-border/70 bg-background p-1.5 shadow-sm transition-all hover:bg-muted hover:scale-105"
                onClick={() => dispatch(setPopUp(true))}
              >
                <Image
                  alt="Edit Icon"
                  src={user.theme === "light" ? editIcon : editIconWhite}
                  width={14}
                  height={14}
                />
              </button>
            </div>

            {/* User Title & Badge info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {user.name || "Unnamed User"}
                </h1>
                {!user.profileComplete &&
                  <Badge variant={user.profileComplete ? "default" : "outline"} className="font-semibold text-xs py-0.5">
                     "Incomplete Profile"
                  </Badge>
                }
              </div>
              <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
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
              className="w-36 gap-2 font-medium"
            >
              {loading ? (
                <>
                  <Spinner /> Saving...
                </>
              ) : edit ? (
                "Save Changes"
              ) : (
                "Edit Profile"
              )}
            </Button>
            {edit && (
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-4 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
      
        <Card className="md:col-span-2 border-border/70 shadow-sm overflow-hidden bg-card/60 backdrop-blur-xs">
          <CardHeader className="border-b border-border/60 bg-muted/10">
            <CardTitle className="text-lg font-bold text-foreground">Profile Details</CardTitle>
            <p className="text-xs text-muted-foreground">Keep your personal and contact details updated.</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </Label>
                {edit ? (
                  <div className="relative">
                    <UserRound className="absolute left-3 top-[11px] size-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 border-border/70 focus-visible:ring-primary focus-visible:border-primary/80"
                      placeholder="Your full name"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-background/30 px-3 text-sm text-foreground shadow-2xs">
                    <UserRound className="size-4 text-muted-foreground" />
                    <span className="font-medium">{name || "-"}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="emailAddress" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                {edit ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-[11px] size-4 text-muted-foreground" />
                    <Input
                      id="emailAddress"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 border-border/70 focus-visible:ring-primary focus-visible:border-primary/80"
                      placeholder="Your email address"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 items-center justify-between rounded-lg border border-border/60 bg-background/30 px-3 text-sm text-foreground shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <span className="font-medium">{email || "-"}</span>
                    </div>
                    {user.emailVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] py-0 px-2 font-medium">Verified</Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] py-0 px-2 font-medium">Unverified</Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Country Code Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="countryCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Country Code
                </Label>
                {edit ? (
                  <Select
                    value={selectedCountryOptionId}
                    onValueChange={(optionId) => {
                      const selectedOption = countryCodeOptions.find(
                        (option) => option.id === optionId
                      );
                      if (selectedOption) {
                        setSelectedCountryOptionId(optionId);
                        setCountryCode(selectedOption.value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full border-border/70 bg-background text-sm focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select Country Code" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[220px]">
                      {countryCodeOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-background/30 px-3 text-sm text-foreground shadow-2xs">
                    <Globe className="size-4 text-muted-foreground" />
                    <span className="font-medium">{countryCode || "-"}</span>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone Number
                </Label>
                {edit ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-[11px] size-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      value={phone || ""}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(digits);
                      }}
                      className="pl-9 border-border/70 focus-visible:ring-primary focus-visible:border-primary/80"
                      placeholder="10-digit number"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 items-center gap-2 rounded-lg border border-border/60 bg-background/30 px-3 text-sm text-foreground shadow-2xs">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="font-medium">{phone || "-"}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <AlertTriangle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>


      {/* Profile Pic Upload Dialog - keep original togglePopup modal */}
      {togglePopup && (
        <Dialog
          open={togglePopup}
          onOpenChange={(open) => dispatch(setPopUp(open))}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Profile Picture</DialogTitle>
              <DialogDescription>
                A picture helps people recognize you and lets you know when you’re signed in to your account.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3">
              <Button
                asChild
                variant="outline"
                className="w-full cursor-pointer"
                disabled={imageLoading}
              >
                <label className="cursor-pointer flex items-center justify-center gap-2">
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

            <DialogFooter className="sm:justify-between gap-2">
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
  );
}
