"use client";
import Card from "@/components/card";

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-gray-700 text-4xl">Welcome to your dashboard!</h1>
      <Card
        title="Card Title"
        description="This is a description for the card."
        className=""
      />
    </>
  );
}
