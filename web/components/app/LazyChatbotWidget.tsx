"use client";

import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(
  () => import("@/components/app/ChatbotWidget").then((m) => m.ChatbotWidget),
  { ssr: false }
);

export function LazyChatbotWidget() {
  return <ChatbotWidget />;
}
