import { ChatPanel } from "@/components/chat/chat-panel";
import { theme } from "@/lib/theme";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className={`text-2xl ${theme.heading}`}>AI Financial Counselor</h1>
        <p className={`mt-1 text-sm ${theme.subtext}`}>
          Personalized advice using your budget, expenses, and planning goals —
          or log spending in natural language.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
