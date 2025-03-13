import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Sidebar } from "./sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-gray-600 bg-opacity-50 z-10 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-20 transform transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Tiyende Admin</h1>
          <button 
            type="button" 
            className="text-gray-500"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          <Sidebar />
        </div>
      </div>
    </>
  );
}
