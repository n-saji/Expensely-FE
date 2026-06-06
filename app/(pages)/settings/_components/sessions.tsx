import { useCallback, useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Clock,
  Smartphone,
  Monitor,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

type SessionStruct = {
  ipAddress: string;
  deviceId: string;
  userId: string;
  lastSeen: string;
  current: boolean | string;
  parser?: UAParser;
};

export default function Sessions() {
  const [sessions, setSessions] = useState<Map<string, SessionStruct>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/sessions/get-all`);
      const data = (await response.data) as Record<string, SessionStruct>;
      setSessions(new Map());
      Object.entries(data).forEach(
        ([key, session]: [string, SessionStruct]) => {
          session.current = session.current === "true";
          const parser = new UAParser(session.deviceId);
          session.parser = parser;
          setSessions((prev) => new Map(prev).set(key, session));
        },
      );
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeOtherSessions = useCallback(
    async (token: string) => {
      try {
        setLoading(true);
        await api.delete(`/users/sessions/id/${token}`);
        toast.success("Other sessions revoked successfully!");
        await fetchSessions();
      } catch (err) {
        console.error("Error revoking sessions:", err);
        toast.error("Failed to revoke other sessions.");
      } finally {
        setLoading(false);
      }
    },
    [fetchSessions],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            View and manage your active sessions across devices.
          </CardDescription>
        </div>
        <CardAction>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchSessions}
            title="Refresh sessions"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin text-muted-foreground" : "text-foreground"}`}
            />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-6 text-sm text-muted-foreground border rounded-lg border-dashed">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading sessions...
          </div>
        ) : sessions.size === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/20">
            <p className="text-sm font-medium text-foreground">
              No active sessions
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You are currently logged out of all other devices.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from(sessions.entries()).map(([key, session]) => {
              const isMobile = session.parser?.getDevice().type === "mobile";
              const deviceName =
                session.parser?.getDevice().model ||
                session.deviceId ||
                "Unknown Device";
              const browserName =
                session.parser?.getBrowser().name || "Unknown Browser";
              const osName = session.parser?.getOS().name || "Unknown OS";

              return (
                <div
                  key={key}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg transition-colors hover:bg-muted/30 ${
                    session.current
                      ? "border-primary/30 bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-secondary rounded-full text-secondary-foreground">
                      {isMobile ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Monitor className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold leading-none">
                          {deviceName}
                        </p>
                        {session.current && (
                          <span className="bg-green-500/15 text-green-600 dark:text-green-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-muted-foreground">
                        {browserName} on {osName}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(
                            parseInt(session.lastSeen),
                          ).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                          {", "}
                          {new Date(
                            parseInt(session.lastSeen),
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-0 ml-12 sm:ml-0 flex-shrink-0">
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={async () => await revokeOtherSessions(key)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log Out
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
