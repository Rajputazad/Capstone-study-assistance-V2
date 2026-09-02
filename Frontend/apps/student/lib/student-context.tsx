"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getUnitName,
  initialApprovedUnits,
  initialChats,
  studentProfile,
  unitCatalog,
  type ApprovedUnit,
  type PendingUnitRequest,
  type StudentChat,
  type StudentProfile,
} from "@/lib/user-data";

interface StudentContextValue {
  profile: StudentProfile;
  approvedUnits: ApprovedUnit[];
  pendingRequests: PendingUnitRequest[];
  approvedUnitCodes: string[];
  activeUnit: string;
  setActiveUnit: (unitCode: string) => void;
  chats: StudentChat[];
  selectedChatId: string | null;
  selectChat: (chatId: string) => void;
  createNewChat: () => void;
  requestUnitAccess: (
    unitCode: string,
    reason?: string,
  ) => { ok: true } | { ok: false; message: string };
  getUnitName: (code: string) => string;
}

const STORAGE_KEY = "capstone-student-state";

interface PersistedState {
  pendingRequests: PendingUnitRequest[];
  chats: StudentChat[];
  activeUnit: string;
  selectedChatId: string | null;
}

type StoredAuthUser = {
  name?: string;
  email?: string;
  studentId?: string;
  approvedUnits?: string[];
};

const StudentContext = createContext<StudentContextValue | null>(null);

function loadPersistedState(fallbackActiveUnit: string): PersistedState {
  if (typeof window === "undefined") {
    return {
      pendingRequests: [],
      chats: initialChats,
      activeUnit: fallbackActiveUnit,
      selectedChatId: initialChats[0]?.id ?? null,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        pendingRequests: [],
        chats: initialChats,
        activeUnit: fallbackActiveUnit,
        selectedChatId: initialChats[0]?.id ?? null,
      };
    }

    const parsed = JSON.parse(raw) as PersistedState;
    return {
      pendingRequests: parsed.pendingRequests ?? [],
      chats: parsed.chats?.length ? parsed.chats : initialChats,
      activeUnit: parsed.activeUnit || fallbackActiveUnit,
      selectedChatId: parsed.selectedChatId ?? initialChats[0]?.id ?? null,
    };
  } catch {
    return {
      pendingRequests: [],
      chats: initialChats,
      activeUnit: fallbackActiveUnit,
      selectedChatId: initialChats[0]?.id ?? null,
    };
  }
}

function loadAuthStudent() {
  if (typeof window === "undefined") {
    return {
      profile: studentProfile,
      approvedUnits: initialApprovedUnits,
    };
  }

  try {
    const raw = localStorage.getItem("capstone_auth_user");
    if (!raw) {
      return {
        profile: studentProfile,
        approvedUnits: initialApprovedUnits,
      };
    }

    const user = JSON.parse(raw) as StoredAuthUser;
    const units = user.approvedUnits?.length
      ? user.approvedUnits.map((code) => ({
          code,
          name: getUnitName(code),
          status: "Approved" as const,
        }))
      : initialApprovedUnits;

    return {
      profile: {
        name: user.name || studentProfile.name,
        email: user.email || studentProfile.email,
        studentId: user.studentId || studentProfile.studentId,
        initials: (user.name || studentProfile.name)
          .split(" ")
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
      },
      approvedUnits: units,
    };
  } catch {
    return {
      profile: studentProfile,
      approvedUnits: initialApprovedUnits,
    };
  }
}

export function StudentProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile>(studentProfile);
  const [approvedUnits, setApprovedUnits] = useState<ApprovedUnit[]>(initialApprovedUnits);
  const approvedUnitCodes = useMemo(
    () => approvedUnits.map((unit) => unit.code),
    [approvedUnits],
  );
  const defaultActiveUnit = "";

  const [pendingRequests, setPendingRequests] = useState<PendingUnitRequest[]>([]);
  const [chats, setChats] = useState<StudentChat[]>(initialChats);
  const [activeUnit, setActiveUnitState] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    initialChats[0]?.id ?? null,
  );

  useEffect(() => {
    const authStudent = loadAuthStudent();
    setProfile(authStudent.profile);
    setApprovedUnits(authStudent.approvedUnits);

    const persisted = loadPersistedState(defaultActiveUnit);
    const loadedUnitCodes = authStudent.approvedUnits.map((unit) => unit.code);
    setPendingRequests(persisted.pendingRequests);
    setChats(persisted.chats);
    setActiveUnitState(
      persisted.activeUnit && loadedUnitCodes.includes(persisted.activeUnit)
        ? persisted.activeUnit
        : "",
    );
    setSelectedChatId(persisted.selectedChatId);
  }, []);

  useEffect(() => {
    const payload: PersistedState = {
      pendingRequests,
      chats,
      activeUnit,
      selectedChatId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [pendingRequests, chats, activeUnit, selectedChatId]);

  const setActiveUnit = useCallback(
    (unitCode: string) => {
      if (unitCode === "") {
        setActiveUnitState("");
        return;
      }

      if (approvedUnitCodes.includes(unitCode)) {
        setActiveUnitState(unitCode);
        setChats((current) =>
          current.map((chat) =>
            chat.id === selectedChatId ? { ...chat, unitCode } : chat,
          ),
        );
      }
    },
    [approvedUnitCodes, selectedChatId],
  );

  const selectChat = useCallback(
    (chatId: string) => {
      const chat = chats.find((entry) => entry.id === chatId);
      if (!chat) return;
      setSelectedChatId(chatId);
      if (chat.unitCode && approvedUnitCodes.includes(chat.unitCode)) {
        setActiveUnitState(chat.unitCode);
      } else {
        setActiveUnitState("");
      }
    },
    [approvedUnitCodes, chats],
  );

  const createNewChat = useCallback(() => {
    const id = crypto.randomUUID();
    const newChat: StudentChat = {
      id,
      title: "New conversation",
      unitCode: "",
      date: "Today",
    };

    setChats((current) => [newChat, ...current]);
    setSelectedChatId(id);
    setActiveUnitState("");
  }, []);

  const requestUnitAccess = useCallback(
    (
      unitCode: string,
      reason?: string,
    ): { ok: true } | { ok: false; message: string } => {
      const normalized = unitCode.trim().toUpperCase();
      if (!normalized) {
        return { ok: false, message: "Select a unit to continue." };
      }

      const catalogEntry = unitCatalog.find((unit) => unit.code === normalized);
      if (!catalogEntry) {
        return { ok: false, message: "Unit code not found." };
      }

      if (approvedUnitCodes.includes(normalized)) {
        return { ok: false, message: "You already have access to this unit." };
      }

      if (pendingRequests.some((request) => request.unitCode === normalized)) {
        return { ok: false, message: "A request for this unit is already pending." };
      }

      setPendingRequests((current) => [
        {
          id: crypto.randomUUID(),
          unitCode: normalized,
          unitName: catalogEntry.name,
          reason: reason?.trim() || undefined,
          requestedAt: new Date().toISOString(),
          status: "pending",
        },
        ...current,
      ]);

      return { ok: true };
    },
    [approvedUnitCodes, pendingRequests],
  );

  const value = useMemo<StudentContextValue>(
    () => ({
      profile: studentProfile,
      approvedUnits,
      pendingRequests,
      approvedUnitCodes,
      activeUnit,
      setActiveUnit,
      chats,
      selectedChatId,
      selectChat,
      createNewChat,
      requestUnitAccess,
      getUnitName,
    }),
    [
      profile,
      approvedUnits,
      pendingRequests,
      approvedUnitCodes,
      activeUnit,
      chats,
      selectedChatId,
      selectChat,
      createNewChat,
      requestUnitAccess,
    ],
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within StudentProvider");
  }
  return context;
}
