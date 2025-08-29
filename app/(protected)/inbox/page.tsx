import { Metadata } from "next";
import { Chat } from "./_components";

export const metadata: Metadata = {
  title: "Inbox | HopeCircle",
};

export default function ChatPage() {
  return <Chat />;
}
