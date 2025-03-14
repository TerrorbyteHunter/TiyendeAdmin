
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  BarChart2,
  Settings,
  ShoppingBag,
  Users,
  Truck as TruckIcon,
  Map,
  CreditCard,
  UserCircle
} from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Users", href: "/users", icon: UserCircle },
  {
    name: "MANAGEMENT",
    items: [
      { name: "Vendors", href: "/vendors", icon: TruckIcon },
      { name: "Bus & Routes", href: "/routes", icon: Map },
      { name: "Tickets & Payments", href: "/tickets", icon: CreditCard },
    ],
  },
  {
    name: "REPORTS",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart2 },
    ],
  }
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <nav className={cn("flex-1 space-y-4", className)}>
      {sidebarItems.map((item, i) => (
        <div key={i} className="space-y-2">
          {item.name && !item.href && (
            <h4 className="px-2 text-xs font-semibold tracking-tight text-gray-500">
              {item.name}
            </h4>
          )}
          {item.href ? (
            <Link href={item.href}>
              <a className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </a>
            </Link>
          ) : (
            item.items && (
              <div className="space-y-1">
                {item.items.map((subItem, j) => (
                  <Link key={j} href={subItem.href}>
                    <a className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                      <subItem.icon className="mr-2 h-4 w-4" />
                      <span>{subItem.name}</span>
                    </a>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      ))}
    </nav>
  );
}
