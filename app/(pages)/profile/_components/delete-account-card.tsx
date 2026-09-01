"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { API_URL } from "@/config/config";
import api from "@/lib/api";
import { setUser } from "@/redux/slices/userSlice";
import { RootState } from "@/redux/store";

export default function DeleteAccountCard() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const resetConfirmation = () => {
    setPassword("");
    setPasswordError("");
  };

  const handleConfirmAndDeleteAccount = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user.id) {
      toast.error("User ID is required for deletion.");
      return;
    }
    if (!password) {
      setPasswordError("Password is required to delete your account.");
      return;
    }

    setPasswordError("");
    setIsVerifying(true);

    try {
      const confirmation = await api.post(`${API_URL}/users/confirm-password`, {
        userId: user.id,
        password,
      });

      if (!confirmation.data?.valid) {
        const message =
          confirmation.data?.message || "Incorrect password. Please try again.";
        setPasswordError(message);
        toast.error(message);
        return;
      }

      const response = await api.delete(
        `${API_URL}/users/delete-account/${user.id}`,
      );

      if (response.data.error !== null) {
        toast.error(response.data.message || "Failed to delete account.");
        return;
      }

      dispatch(setUser({ ...user, isActive: false }));
      toast.success("Account deleted successfully!");
      localStorage.removeItem("user_id");
      localStorage.removeItem("theme");
      localStorage.removeItem("themeColor");
      setIsOpen(false);
      resetConfirmation();
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error: any) {
      console.error("Error confirming password / deleting account:", error);
      const message =
        error?.response?.data?.message ||
        "Invalid password or failed to verify identity.";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full border-destructive/25 bg-destructive/3 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle>Delete Account</CardTitle>
        <CardDescription>
          Permanently delete your account. This action cannot be undone.
        </CardDescription>
        <CardAction>
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) resetConfirmation();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-destructive">
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action is
                  permanent and cannot be undone. Please enter your password to
                  confirm your identity.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleConfirmAndDeleteAccount}>
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label htmlFor="delete-account-password">Password</Label>
                    <Input
                      id="delete-account-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      disabled={isVerifying}
                    />
                    {passwordError && (
                      <p className="mt-1 text-xs text-destructive">
                        {passwordError}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter className="mt-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isVerifying}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={!password || isVerifying}
                  >
                    {isVerifying ? (
                      <span className="flex items-center gap-2">
                        <Spinner className="h-4 w-4 text-destructive-foreground" />
                        Confirming...
                      </span>
                    ) : (
                      "Confirm & Delete Account"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
