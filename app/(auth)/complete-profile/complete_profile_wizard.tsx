"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RootState } from "@/redux/store";
import { setUser } from "@/redux/slices/userSlice";
import api from "@/lib/api";
import { supabase } from "@/utils/supabase";
import fetchProfileUrl from "@/utils/fetchProfileURl";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import defaultPNG from "@/assets/icon/user.png";
import UserPreferences from "@/utils/userPreferences";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProgressBar } from "@/components/ProgressBar";
import {
  TOP_100_COUNTRY_CODES,
  STRONG_PASSWORD_REGEX,
} from "@/app/(auth)/register/register_form_constants";
import {
  THEME_COLOR_OPTIONS,
  ThemeColorId,
  DEFAULT_THEME_COLOR,
  THEME_COLOR_IDS,
} from "@/global/constants";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Palette,
  Bell,
  Sun,
  Moon,
  Trash2,
  AlertCircle,
} from "lucide-react";

type CountrySelectOption = {
  label: string;
  value: string;
  id: string;
};

export default function CompleteProfileWizard() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState("");

  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [profilePicFilePath, setProfilePicFilePath] = useState("");
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [themeColor, setThemeColor] = useState<ThemeColorId>("teal");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasFetchedRef = useRef(false);

  const countryCodeOptions = useMemo<CountrySelectOption[]>(
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

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchUser = async () => {
      setFetchingUser(true);
      try {
        const response = await api.get(`/users/me`);
        if (response.status === 200 && response.data?.user) {
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
              themeColor: profile.themeColor ?? profile.theme_color,
              language: profile.language,
              isActive: profile.isActive,
              isAdmin: profile.isAdmin,
              notificationsEnabled: profile.notificationsEnabled,
              alertsEnabled: profile.alerts_enabled ?? profile.alertsEnabled,
              profilePicFilePath: profile.profilePicFilePath,
              profilePictureUrl: profile.profilePictureUrl,
              profileComplete: profile.profileComplete,
              emailVerified: profile.emailVerified,
            })
          );

          if (profile.country_code) setCountryCode(profile.country_code);
          if (profile.phone) setPhone(profile.phone);
          if (profile.theme) setTheme(profile.theme);
          if (profile.themeColor ?? profile.theme_color) {
            setThemeColor((profile.themeColor ?? profile.theme_color) as ThemeColorId);
          }
          if (profile.notificationsEnabled !== undefined) {
            setNotificationsEnabled(profile.notificationsEnabled);
          }
          if (profile.alerts_enabled !== undefined) {
            setAlertsEnabled(profile.alerts_enabled);
          } else if (profile.alertsEnabled !== undefined) {
            setAlertsEnabled(profile.alertsEnabled);
          }
          if (profile.profilePictureUrl) {
            setProfilePicPreview(profile.profilePictureUrl);
          }
          if (profile.profilePicFilePath) {
            setProfilePicFilePath(profile.profilePicFilePath);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Failed to load user configuration.");
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUser();
  }, [dispatch]);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: "", color: "", widthClass: "w-0" };
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z\d]/.test(password);
    const hasMinimumLength = password.length >= 8;
    const hasRequiredRules = hasLetter && hasNumber && hasSpecial && hasMinimumLength;

    if (!hasRequiredRules) {
      return { label: "Weak", color: "bg-rose-500", widthClass: "w-1/3" };
    }
    if (password.length < 10) {
      return { label: "Medium", color: "bg-amber-400", widthClass: "w-2/3" };
    }
    return { label: "Strong", color: "bg-emerald-500", widthClass: "w-full" };
  }, [password]);

  const updateLocalTheme = (nextTheme: "light" | "dark") => {
    setTheme(nextTheme);
    dispatch(setUser({ theme: nextTheme }));
  };

  const updateLocalThemeColor = (nextColor: ThemeColorId) => {
    setThemeColor(nextColor);
    dispatch(setUser({ themeColor: nextColor }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE_BYTES) {
        toast.error("Profile picture size must be less than 5MB.");
        return;
      }
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfilePicFile(null);
    setProfilePicPreview("");
    setProfilePicFilePath("");
  };

  const validateStep = (currentStep: number) => {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!countryCode) {
        nextErrors.countryCode = "Country code is required.";
      }
      if (!phone) {
        nextErrors.phone = "Phone number is required.";
      } else if (!/^\d{10}$/.test(phone)) {
        nextErrors.phone = "Phone number must be exactly 10 digits.";
      }
    }

    if (currentStep === 2) {
      if (!user.isOauth2User) {
        if (!password) {
          nextErrors.password = "Password is required.";
        } else if (!STRONG_PASSWORD_REGEX.test(password)) {
          nextErrors.password =
            "Password must be at least 8 characters, with letters, numbers, and special characters.";
        }
        if (!confirmPassword) {
          nextErrors.confirmPassword = "Confirm password is required.";
        } else if (password !== confirmPassword) {
          nextErrors.confirmPassword = "Passwords do not match.";
        }
      } else if (password) {
        if (!STRONG_PASSWORD_REGEX.test(password)) {
          nextErrors.password =
            "Password must be at least 8 characters, with letters, numbers, and special characters.";
        }
        if (password !== confirmPassword) {
          nextErrors.confirmPassword = "Passwords do not match.";
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getErrorMessage = (error: any) => {
    if (error?.response?.status === 400) {
      return error.response.data?.message || error.response.data?.error || "Bad request details.";
    }
    if (error?.response) {
      return "Internal server error. Please try again.";
    }
    return error?.message || "An unexpected error occurred.";
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep(1)) return;

      setCheckingPhone(true);
      try {
        const response = await api.get(`/users/check/phone/${phone}`);
        if (response.data === true) {
          setErrors((prev) => ({
            ...prev,
            phone: "This phone number is already registered.",
          }));
          return;
        }
      } catch (err) {
        console.error("Error checking phone number:", err);
      } finally {
        setCheckingPhone(false);
      }
    }

    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setSubmitting(true);
    setShowProgressDialog(true);
    setSubmissionProgress(10);
    setSubmissionStatus("Initiating account setup...");

    try {
      const userId = user.id || localStorage.getItem("user_id");
      if (!userId) {
        throw new Error("Unable to identify logged-in user.");
      }

      if (password && password.trim().length > 0) {
        setSubmissionProgress(25);
        setSubmissionStatus("Securing account with your password...");
        const pwdRes = await api.patch(`/users/update-password`, {
          password: password,
          id: userId,
        });
        if (pwdRes.status !== 200 || pwdRes.data?.error) {
          throw pwdRes;
        }
      }

      let finalFilePath = profilePicFilePath;
      let finalPictureUrl = profilePicPreview;

      if (profilePicFile) {
        setSubmissionProgress(40);
        setSubmissionStatus("Uploading profile picture to S3 storage...");

        const presignedRes = await api.get(
          `/users/get-profile-presigned-url?fileName=${encodeURIComponent(profilePicFile.name)}&contentType=${encodeURIComponent(profilePicFile.type)}`
        );

        const { url, key } = presignedRes.data;

        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: profilePicFile,
          headers: {
            "Content-Type": profilePicFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload profile picture to S3.");
        }

        setSubmissionProgress(60);
        setSubmissionStatus("Linking profile picture to your profile...");

        const picRes = await api.patch(
          `/users/${userId}/update-profile-picture?filepath=${encodeURIComponent(key)}`,
          { imageUrl: "" }
        );

        if (picRes.status !== 200) {
          throw picRes;
        }

        const updatedUser = picRes.data?.user || picRes.data;
        const publicUrl = updatedUser?.profilePictureUrl || `https://expensely-profiles.s3.us-east-2.amazonaws.com/${key}`;

        finalFilePath = key;
        finalPictureUrl = publicUrl;
      } else if (!profilePicPreview && profilePicFilePath) {
        setSubmissionProgress(50);
        setSubmissionStatus("Removing existing profile picture...");

        const picRes = await api.patch(
          `/users/${userId}/update-profile-picture?filepath=`,
          { imageUrl: "" }
        );
        if (picRes.status !== 200) {
          throw picRes;
        }
        finalFilePath = "";
        finalPictureUrl = "";
      }

      setSubmissionProgress(75);
      setSubmissionStatus("Configuring personalization options...");
      const settingsRes = await api.patch(`/users/update-settings`, {
        id: userId,
        theme: theme,
        themeColor: themeColor,
        notificationsEnabled: notificationsEnabled,
        alerts_enabled: alertsEnabled,
      });

      if (settingsRes.status !== 200 || settingsRes.data?.error) {
        throw settingsRes;
      }

      setSubmissionProgress(90);
      setSubmissionStatus("Applying final contact details...");
      const profileRes = await api.patch(`/users/update-profile`, {
        name: user.name,
        email: user.email,
        country_code: countryCode,
        phone: phone,
        currency: user.currency || "USD",
        id: userId,
        profileComplete: true,
      });

      if (profileRes.status !== 200 || profileRes.data?.error) {
        throw profileRes;
      }

      setSubmissionProgress(100);
      setSubmissionStatus("Onboarding completed successfully!");

      dispatch(
        setUser({
          ...user,
          country_code: countryCode,
          phone: phone,
          theme: theme,
          themeColor: themeColor,
          notificationsEnabled: notificationsEnabled,
          alertsEnabled: alertsEnabled,
          profilePicFilePath: finalFilePath,
          profilePictureUrl: finalPictureUrl,
          profileComplete: true,
        })
      );

      toast.success("Profile fully configured! Welcome to Expensely.");
      setTimeout(() => {
        setShowProgressDialog(false);
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      console.error("Wizard Submit Error:", err);
      const errMsg = getErrorMessage(err);
      toast.error(errMsg);
      setShowProgressDialog(false);
    } finally {
      setSubmitting(false);
      setImageLoading(false);
    }
  };

  const stepsDetails = [
    { title: "Contact Info", icon: User },
    { title: "Setup Password", icon: Lock },
    { title: "Personalize", icon: Palette },
  ];

  if (fetchingUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Spinner className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="mt-4 text-muted-foreground text-sm">Loading your profile data...</p>
      </div>
    );
  }

  return (
    <>
      <UserPreferences />

      <Card className="border border-border/70 bg-card/90 shadow-xl overflow-hidden backdrop-blur-sm max-w-2xl w-full">
        {/* Step Indicator Headers */}
        <div className="border-b border-border/60 bg-muted/20 px-6 py-4">
          <div className="flex items-center justify-between">
            {stepsDetails.map((s, idx) => {
              const StepIcon = s.icon;
              const isCompleted = step > idx + 1;
              const isActive = step === idx + 1;

              return (
                <div key={idx} className="flex items-center gap-2 relative">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground border-primary scale-110"
                        : "bg-background text-muted-foreground border-border/70"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold tracking-wider uppercase transition-colors duration-300 ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                  {idx < stepsDetails.length - 1 && (
                    <div className="hidden sm:block w-8 md:w-16 h-[2px] bg-border/80 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <CardHeader className="space-y-1 text-center py-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {step === 1 && "Complete Your Contact Details"}
            {step === 2 && "Secure Your Account"}
            {step === 3 && "Personalize Your Preferences"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {step === 1 && "Provide a phone number and optionally add a profile picture."}
            {step === 2 && "Choose a strong password to secure your personal dashboard."}
            {step === 3 && "Tailor theme choices and alert modes to your liking."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 min-h-[260px] flex flex-col justify-center"
            >
              {/* Step 1: Contact Detail inputs */}
              {step === 1 && (
                <div className="space-y-5">
                  {/* Profile Pic Upload section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative h-28 w-28 rounded-full ring-4 ring-border/50 bg-muted flex items-center justify-center overflow-hidden">
                      <Image
                        alt="Profile Picture"
                        src={profilePicPreview || defaultPNG}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Button asChild variant="outline" size="sm" className="cursor-pointer gap-2">
                        <label>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                          <Upload className="h-4 w-4 text-muted-foreground" />
                          Upload Picture
                        </label>
                      </Button>
                      {profilePicPreview && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Country Code dropdown and Phone input */}
                  <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                    <div className="space-y-2">
                      <Label htmlFor="country-code" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Country Code
                      </Label>
                      <Select
                        value={selectedCountryOptionId}
                        onValueChange={(optionId) => {
                          const selectedOption = countryCodeOptions.find(
                            (option) => option.id === optionId
                          );
                          if (selectedOption) {
                            setSelectedCountryOptionId(optionId);
                            setCountryCode(selectedOption.value);
                            setErrors((prev) => ({ ...prev, countryCode: "" }));
                          }
                        }}
                      >
                        <SelectTrigger className="w-full border-border/70 bg-background text-sm">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[220px]">
                          {countryCodeOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.countryCode && (
                        <p className="text-xs text-rose-500 font-medium">{errors.countryCode}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter 10-digit number"
                          className="pl-9 border-border/70 bg-background"
                          value={phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setPhone(digits);
                            setErrors((prev) => ({ ...prev, phone: "" }));
                          }}
                        />
                      </div>
                      {errors.phone ? (
                        <p className="text-xs text-rose-500 font-medium">{errors.phone}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">We use this for essential updates.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Password Inputs */}
              {step === 2 && (
                <div className="space-y-5">
                  {user.isOauth2User && (
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>You signed in using Google. Setting a password is optional.</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      New Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-9 pr-9 border-border/70 bg-background"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.widthClass}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          Strength: <span className="font-semibold text-foreground">{passwordStrength.label}</span>
                        </p>
                      </div>
                    )}
                    {errors.password && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-9 pr-9 border-border/70 bg-background"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-rose-500 font-medium mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Preferences Settings */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Theme toggler cards */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
                      Appearance Theme
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Light Card */}
                      <button
                        type="button"
                        onClick={() => updateLocalTheme("light")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          theme === "light"
                            ? "border-primary shadow-md scale-102"
                            : "border-border/60 hover:border-border hover:scale-101"
                        }`}
                      >
                        <Sun className={`h-6 w-6 mb-2 ${theme === "light" ? "text-amber-500" : "text-muted-foreground"}`} />
                        <span className="text-sm font-semibold text-foreground">Light Mode</span>
                      </button>

                      {/* Dark Card */}
                      <button
                        type="button"
                        onClick={() => updateLocalTheme("dark")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          theme === "dark"
                            ? "border-primary shadow-md scale-102"
                            : "border-border/60 hover:border-border hover:scale-101"
                        }`}
                      >
                        <Moon className={`h-6 w-6 mb-2 ${theme === "dark" ? "text-indigo-400" : "text-muted-foreground"}`} />
                        <span className="text-sm font-semibold text-foreground">Dark Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* Theme Accent Color */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
                      Accent Color Theme
                    </Label>
                    <div className="flex flex-wrap items-center justify-start gap-3 bg-muted/30 p-3 rounded-xl border border-border/40">
                      {THEME_COLOR_OPTIONS.map((option) => {
                        const isSelected = themeColor === option.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            title={option.label}
                            onClick={() => updateLocalThemeColor(option.id)}
                            className={`h-8 w-8 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                              isSelected
                                ? "border-foreground scale-115 shadow-sm"
                                : "border-border/60 hover:scale-105"
                            }`}
                            style={{ backgroundColor: option.swatch }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Switch Toggles for Notifications and Alerts */}
                  <div className="grid gap-3 pt-2">
                    {/* Notifications Switch */}
                    <div className="flex items-center justify-between rounded-xl border border-border/70 p-4 bg-background">
                      <div className="space-y-0.5 pr-2">
                        <Label htmlFor="notifications" className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          Notifications
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Receive essential notification updates.
                        </p>
                      </div>
                      <Switch
                        id="notifications"
                        checked={notificationsEnabled}
                        onCheckedChange={setNotificationsEnabled}
                      />
                    </div>

                    {/* Desktop Alerts Switch */}
                    <div className="flex items-center justify-between rounded-xl border border-border/70 p-4 bg-background">
                      <div className="space-y-0.5 pr-2">
                        <Label htmlFor="alerts" className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          Dashboard Alerts
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Show helpful notifications banner on dashboard.
                        </p>
                      </div>
                      <Switch
                        id="alerts"
                        checked={alertsEnabled}
                        onCheckedChange={setAlertsEnabled}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Wizard Footer Controls */}
        <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/10 px-6 py-4">
          <div>
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={submitting || imageLoading}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button onClick={handleNext} disabled={checkingPhone} className="gap-1.5">
                {checkingPhone ? (
                  <>
                    <Spinner className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || imageLoading}
                className="gap-1.5 font-semibold shadow-md min-w-[140px]"
              >
                {submitting ? (
                  <>
                    <Spinner className="h-4 w-4 animate-spin text-primary-foreground" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Onboarding submission progress overlay */}
      <Dialog open={showProgressDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md pointer-events-none select-none [&>button]:hidden">
          <div className="flex flex-col items-center justify-center p-6 space-y-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
              <Spinner className="h-6 w-6 animate-spin text-primary" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="font-semibold text-lg text-foreground">Setting Up Your Account</h3>
              <p className="text-sm text-muted-foreground">{submissionStatus}</p>
            </div>
            <ProgressBar value={submissionProgress} max={100} showAnimation variant="success" />
            <div className="w-full text-right text-xs text-muted-foreground font-semibold">
              {submissionProgress}%
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
