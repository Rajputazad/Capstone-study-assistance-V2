import { Suspense } from "react";
import { AiAssistantPage } from "@/components/chat/ai-assistant-page";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <AiAssistantPage />
    </Suspense>
  );
}
