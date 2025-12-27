"use client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertDto } from "@/global/dto";
import api from "@/lib/api";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AlertComponent() {
  const [alerts, setAlerts] = useState<Array<AlertDto>>([]);
  useEffect(() => {
    const FetchAlerts = async () => {
      try {
        const response = await api.get("/users/alerts");
        if (response.status === 200) {
          const data = response.data;
          setAlerts(data);
          // Process the fetched alerts data as needed
        } else {
          toast.error("Failed to fetch alerts", {
            description: `Server responded with status ${response.status}`,
          });
        }
      } catch (error) {
        toast.error("An error occurred while fetching alerts", {
          description: (error as Error).message,
        });
      }
    };
    FetchAlerts();
  }, []);

  return (
    alerts &&
    alerts.length > 0 &&
    alerts.map((alert, index) => (
      <Alert
        key={index}
        className={`flex justify-center p-2 rounded-none text-sm shadow-none w-full
          bg-transparent
            ${alert.type === "WARNING" ? "text-yellow-600" : ""}
            ${alert.type === "INFO" ? "text-blue-100" : ""}
            ${alert.type === "success" ? "text-green-100" : ""}
            `}
        variant={alert.type === "CRITICAL" ? "destructive" : "default"}
      >
        {alert.type === "CRITICAL" && <AlertCircleIcon />}
        {alert.type === "WARNING" && <TriangleAlertIcon />}
        {alert.type === "INFO" && <InfoIcon />}
        {alert.type === "success" && <CheckCircle2Icon />}
        <AlertTitle>{alert.message}</AlertTitle>
      </Alert>
    ))
  );
}
