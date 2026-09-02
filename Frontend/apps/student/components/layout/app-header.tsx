import { HelpIcon } from "@/components/icons";

export function AppHeader() {
  return (
    <header className="relative flex h-[48px] shrink-0 items-center border-b border-capstone-border bg-white px-6">
      <div className="flex flex-1 items-center justify-center">
        <span className="text-[13px] font-medium leading-none text-gray-800">
          Capstone Study Assistant Prototype
        </span>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <button
          type="button"
          aria-label="Help"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
        >
          <HelpIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
