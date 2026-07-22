"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { FaGoogle, FaGithub, FaDiscord } from "react-icons/fa";
import api from "@/lib/api";

interface LinkedAccount {
  provider: string;
  providerUserId: string;
  providerEmail: string;
  createdAt: string;
}

const PROVIDERS = [
  {
    id: "google",
    name: "Google",
    icon: FaGoogle,
    color: "text-red-500",
  },
  {
    id: "github",
    name: "GitHub",
    icon: FaGithub,
    color: "text-neutral-900 dark:text-neutral-100",
  },
  {
    id: "discord",
    name: "Discord",
    icon: FaDiscord,
    color: "text-indigo-500",
  },
];

export default function OAuthAccounts() {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [confirmProvider, setConfirmProvider] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchLinkedAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/oauth/linked-accounts");
      if (res.status === 200 && Array.isArray(res.data)) {
        setLinkedAccounts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch linked OAuth accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinkedAccounts();
  }, [fetchLinkedAccounts]);

  useEffect(() => {
    const linkedState = searchParams.get("linked");
    if (linkedState === "success") {
      toast.success("Social account linked successfully!");
      fetchLinkedAccounts();
      router.replace("/settings?tab=security");
    } else if (linkedState === "error") {
      const msg = searchParams.get("message") || "Failed to link account.";
      toast.error(decodeURIComponent(msg));
      router.replace("/settings?tab=security");
    }
  }, [searchParams, router, fetchLinkedAccounts]);

  const handleLink = (providerId: string) => {
    signIn(providerId, { callbackUrl: "/auth-handler?action=link" }).catch((err) => {
      console.error(`Failed to initiate ${providerId} login:`, err);
      toast.error(`Could not connect to ${providerId}.`);
    });
  };

  const handleUnlink = async (providerId: string) => {
    try {
      setUnlinkingProvider(providerId);
      const res = await api.delete(`/users/oauth/unlink/${providerId}`);
      if (res.status === 200) {
        toast.success(`Unlinked ${providerId} account successfully.`);
        await fetchLinkedAccounts();
      } else {
        toast.error(res.data?.message || `Failed to unlink ${providerId}.`);
      }
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      toast.error(backendMsg || `An error occurred while unlinking ${providerId}.`);
    } finally {
      setUnlinkingProvider(null);
      setConfirmProvider(null);
    }
  };

  return (
    <Card className="w-full border-border/70 shadow-sm overflow-hidden p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          OAuth & Linked Accounts
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect your social accounts to log in seamlessly using Google, GitHub, or Discord.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Spinner /> Loading linked accounts...
        </div>
      ) : (
        <div className="grid gap-4">
          {PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const linkedInfo = linkedAccounts.find(
              (acc) => acc.provider.toLowerCase() === provider.id
            );
            const isLinked = Boolean(linkedInfo);

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/70 bg-card hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full bg-muted/60 ${provider.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {provider.name}
                      </span>
                      {isLinked ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                          Connected
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                          Not Connected
                        </span>
                      )}
                    </div>
                    {isLinked && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {linkedInfo?.providerEmail || "Connected"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  {isLinked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      onClick={() => setConfirmProvider(provider.id)}
                      disabled={unlinkingProvider === provider.id}
                    >
                      {unlinkingProvider === provider.id ? (
                        <>
                          <Spinner /> Unlinking...
                        </>
                      ) : (
                        "Unlink"
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLink(provider.id)}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Unlinking */}
      <Dialog
        open={Boolean(confirmProvider)}
        onOpenChange={(open) => {
          if (!open) setConfirmProvider(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unlink Social Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your{" "}
              <span className="font-semibold text-foreground uppercase">
                {confirmProvider}
              </span>{" "}
              account? You won&apos;t be able to use it to sign in unless you reconnect it.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmProvider(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmProvider) handleUnlink(confirmProvider);
              }}
              disabled={Boolean(unlinkingProvider)}
            >
              {unlinkingProvider ? <Spinner /> : "Confirm Unlink"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
