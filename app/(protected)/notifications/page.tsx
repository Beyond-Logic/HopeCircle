import React from "react";
import { Notifications } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | HopeCircle",
};

export default function NotificationsPage() {
  return <Notifications />;
}
