import { AuthGate } from "@/components/chat/auth-gate";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
