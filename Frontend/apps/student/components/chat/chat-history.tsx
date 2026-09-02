"use client";

import { AddIcon } from "@/components/icons";
import { useStudent } from "@/lib/student-context";

export function ChatHistory() {
  const { chats, selectedChatId, selectChat, createNewChat, approvedUnitCodes } = useStudent();

  return (
    <aside className="flex w-[196px] shrink-0 flex-col border-r border-capstone-border bg-white">
      <div className="p-2.5">
        <button
          type="button"
          onClick={createNewChat}
          disabled={approvedUnitCodes.length === 0}
          className="flex w-full items-center justify-center gap-1 rounded-[8px] bg-capstone-red px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-capstone-red-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AddIcon className="text-base" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <p className="mb-1.5 px-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400">
          Recent
        </p>
        {chats.length > 0 ? (
          <ul className="space-y-0.5">
            {chats.map((chat) => {
              const selected = selectedChatId === chat.id;
              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => selectChat(chat.id)}
                    className={`w-full rounded-[6px] px-2 py-1.5 text-left transition-colors ${
                      selected
                        ? "border-l-2 border-capstone-red bg-capstone-red-light pl-[6px]"
                        : "border-l-2 border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <p
                      className={`truncate text-[13px] font-medium leading-tight ${
                        selected ? "text-capstone-red" : "text-gray-800"
                      }`}
                    >
                      {chat.title}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {chat.unitCode ? `${chat.unitCode} · ${chat.date}` : `Select unit · ${chat.date}`}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-1 text-[11px] text-gray-500">No chats yet</p>
        )}
      </div>
    </aside>
  );
}
