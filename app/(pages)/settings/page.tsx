"use client";
import Card from "@/components/card";

export default function DashboardPage() {
  return (
    <div className="p-8 flex flex-col space-y-4 w-full items-center overflow-auto">
      <h1 className="text-gray-700 text-4xl">Welcome to Settings!</h1>
      <Card
        title="Card Title"
        description="This is a description for the card."
        className=""
      />
    </div>
  );
}
