import { ChatPanel } from "@/components/chat/chat-panel";

export default function ChatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">AI Financial Counselor</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ask for budgets, savings plans, or log spending in natural language.
        </p>
      </div>
      <ChatPanel />
    </div>
  );
}
