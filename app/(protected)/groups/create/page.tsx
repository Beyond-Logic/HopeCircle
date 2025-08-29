import React from "react";
import { CreateGroup } from "./_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Community | HopeCircle",
};

export default function CreateGroupPage() {
  return <CreateGroup />;
}
