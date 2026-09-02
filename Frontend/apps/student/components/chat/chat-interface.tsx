"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatBubbleIcon, SendIcon } from "@/components/icons";
import { UnitSelector } from "@/components/chat/unit-selector";
import { useStudent } from "@/lib/student-context";

const promptSuggestions = [
  "What should I do in Week 1?",
  "How should I prepare for a supervisor meeting?",
  "What are the AI usage guidelines?",
  "How should our team handle a passive contributor?",
  "What is expected during client meetings?",
  "Where can I find the submission templates?",
];

export function ChatInterface() {
  const searchParams = useSearchParams();
  const {
    approvedUnits,
    approvedUnitCodes,
    activeUnit,
    setActiveUnit,
    selectedChatId,
    chats,
    profile,
  } = useStudent();
  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const firstName = profile.name.split(" ")[0];
  const [message, setMessage] = useState("");
  const hasUnitSelected = activeUnit !== "" && approvedUnitCodes.includes(activeUnit);

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setMessage(prompt);
      if (!activeUnit && approvedUnitCodes.length > 0) {
        setActiveUnit(approvedUnitCodes[0]);
      }
    }
  }, [searchParams, activeUnit, approvedUnitCodes, setActiveUnit]);

  if (approvedUnitCodes.length === 0) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-[14px] font-semibold text-gray-900">No approved units</p>
        <p className="mt-1 max-w-sm text-[13px] text-gray-500">
          Request unit access from your Profile page. Once a professor approves your request,
          you can use the AI assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-capstone-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-capstone-red-light text-capstone-red">
            <ChatBubbleIcon />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold leading-tight text-gray-900">
              Capstone AI Assistant
            </h2>
            <p className="text-[11px] leading-tight text-gray-500">
              Answering in context of your approved units
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnitSelected ? (
            <span className="inline-flex h-7 items-center rounded-full bg-capstone-red px-2.5 text-[11px] font-semibold text-white">
              {activeUnit}
            </span>
          ) : null}
          <span className="inline-flex h-7 items-center gap-1 text-[11px] leading-none text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            online
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {!hasUnitSelected ? (
            <div className="max-w-[680px] rounded-[12px] border border-capstone-border bg-white px-4 py-3.5 shadow-card">
              <p className="text-[13px] leading-[1.6] text-gray-700">
                Which unit would you like to ask about? Please select one of your approved units
                from the dropdown below to set the chat context.
              </p>
              <UnitSelector
                units={approvedUnits}
                value={activeUnit}
                onChange={setActiveUnit}
              />
            </div>
          ) : (
            <div className="max-w-[680px] rounded-[12px] border border-capstone-border bg-white px-4 py-3.5 shadow-card">
              <p className="text-[13px] leading-[1.6] text-gray-700">
                Hi {firstName}! I&apos;m your Capstone Study Assistant. I can help you understand
                your unit resources, team responsibilities, supervisor meetings, professional
                behaviour, project organisation and other Capstone-related questions. You&apos;re
                currently asking in the context of{" "}
                <strong className="font-semibold text-gray-900">{activeUnit}</strong>.
              </p>
              <div className="mt-3 border-t border-figma-border pt-3">
                <p className="mb-2 text-[11px] font-medium text-gray-500">Change unit context</p>
                <UnitSelector
                  units={approvedUnits}
                  value={activeUnit}
                  onChange={setActiveUnit}
                />
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-capstone-border bg-white px-5 py-4">
          {hasUnitSelected ? (
            <>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {promptSuggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setMessage(prompt)}
                    className="rounded-full border border-capstone-border bg-white px-2.5 py-1 text-[11px] text-gray-700 transition-colors hover:border-capstone-red hover:text-capstone-red"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 rounded-[10px] border border-capstone-border bg-white px-3 py-2">
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={`Ask about ${activeUnit}...`}
                  className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-capstone-red text-white transition-colors hover:bg-capstone-red-dark"
                  aria-label="Send message"
                >
                  <SendIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-[12px] text-gray-400">
              Select a unit above to start chatting
            </p>
          )}

          <p className="mt-2.5 text-center text-[10px] text-gray-400">
            AI guidance only — verify important decisions with your unit supervisor.
          </p>
        </div>
      </div>
    </div>
  );
}
