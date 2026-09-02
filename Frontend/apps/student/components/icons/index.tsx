import type { IconType } from "react-icons";
import {
  MdAdd,
  MdAutoAwesome,
  MdChatBubbleOutline,
  MdClose,
  MdDownload,
  MdExpandMore,
  MdHelpOutline,
  MdLogout,
  MdMenuBook,
  MdPersonOutline,
  MdSearch,
  MdSend,
  MdSmartToy,
  MdVisibility,
} from "react-icons/md";

type IconProps = {
  className?: string;
};

function materialIcon(Icon: IconType, defaultClassName: string) {
  return function MaterialIcon({ className = defaultClassName }: IconProps) {
    return <Icon className={className} aria-hidden />;
  };
}

export const AiAssistantIcon = materialIcon(MdSmartToy, "h-4 w-4");
export const UnitResourcesIcon = materialIcon(MdMenuBook, "h-4 w-4");
export const ProfileIcon = materialIcon(MdPersonOutline, "h-4 w-4");
export const SendIcon = materialIcon(MdSend, "h-4 w-4");
export const ChatBubbleIcon = materialIcon(MdChatBubbleOutline, "h-4 w-4");
export const SparkleIcon = materialIcon(MdAutoAwesome, "h-5 w-5");
export const SearchIcon = materialIcon(MdSearch, "h-4 w-4");
export const ChevronDownIcon = materialIcon(MdExpandMore, "h-4 w-4");
export const ViewIcon = materialIcon(MdVisibility, "h-3.5 w-3.5");
export const DownloadIcon = materialIcon(MdDownload, "h-3.5 w-3.5");
export const SignOutIcon = materialIcon(MdLogout, "h-4 w-4");
export const HelpIcon = materialIcon(MdHelpOutline, "h-4 w-4");
export const AddIcon = materialIcon(MdAdd, "h-4 w-4");
export const CloseIcon = materialIcon(MdClose, "h-4 w-4");
