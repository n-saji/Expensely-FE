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
import { motion } from "framer-motion";

export default function AlertComponent() {
  const [alerts, setAlerts] = useState<Array<AlertDto>>([]);
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

  useEffect(() => {
    FetchAlerts();
  }, []);

  useEffect(() => {
    const handler = () => {
      FetchAlerts();
    };
    window.addEventListener("expense-added", handler);
    return () => window.removeEventListener("expense-added", handler);
  }, []);

  return (
    alerts &&
    alerts.length > 0 &&
    alerts.map((alert, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      >
        <Alert
          key={index}
          className={`flex justify-center p-2 rounded-none text-sm shadow-none w-full
            ${alert.type === "WARNING" ? "text-yellow-600" : ""}
            ${alert.type === "INFO" ? "text-blue-100" : ""}
            ${alert.type === "success" ? "text-green-100" : ""}
            `}
          variant={alert.type === "CRITICAL" ? "destructive" : "default"}
        >
          <div className="flex items-center gap-2">
            {alert.type === "CRITICAL" && (
              <AlertCircleIcon className="h-4 w-4" />
            )}
            {alert.type === "WARNING" && (
              <TriangleAlertIcon className="h-4 w-4" />
            )}
            {alert.type === "INFO" && <InfoIcon className="h-4 w-4" />}
            {alert.type === "success" && (
              <CheckCircle2Icon className="h-4 w-4" />
            )}
            <AlertTitle>{alert.message}</AlertTitle>
          </div>
        </Alert>
      </motion.div>
    ))
  );
}
