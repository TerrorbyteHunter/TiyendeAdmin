import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  FileText, 
  Ticket, 
  BarChart3, 
  Settings, 
  MapPin 
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

const SidebarItem = ({ href, icon, children, isActive }: SidebarItemProps) => {
  return (
    <a 
      href={href} 
      className={cn(
        "sidebar-item flex items-center py-2 px-4 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100",
        isActive && "active bg-blue-50 border-l-3 border-primary text-primary"
      )}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </a>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  
  return (
    <aside className="bg-white w-64 h-full flex-shrink-0 border-r border-gray-200 hidden md:block">
      <div className="h-16 px-6 flex items-center border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Tiyende Admin</h1>
      </div>
      <nav className="px-2 pt-4 h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <SidebarItem href="/" icon={<Home className="h-5 w-5" />} isActive={location === "/"}>
            Dashboard
          </SidebarItem>
          
          <div className="py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Management
            </p>
            <SidebarItem 
              href="/vendors" 
              icon={<Users className="h-5 w-5" />} 
              isActive={location === "/vendors"}
            >
              Users & Vendors
            </SidebarItem>
            <SidebarItem 
              href="/routes" 
              icon={<MapPin className="h-5 w-5" />} 
              isActive={location === "/routes"}
            >
              Bus & Routes
            </SidebarItem>
            <SidebarItem 
              href="/tickets" 
              icon={<Ticket className="h-5 w-5" />} 
              isActive={location === "/tickets"}
            >
              Tickets & Payments
            </SidebarItem>
          </div>
          
          <div className="py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Reports
            </p>
            <SidebarItem 
              href="/analytics" 
              icon={<BarChart3 className="h-5 w-5" />} 
              isActive={location === "/analytics"}
            >
              Analytics
            </SidebarItem>
          </div>
          
          <div className="py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
              Configuration
            </p>
            <SidebarItem 
              href="/settings" 
              icon={<Settings className="h-5 w-5" />} 
              isActive={location === "/settings"}
            >
              System Settings
            </SidebarItem>
          </div>
        </div>
      </nav>
    </aside>
  );
}
