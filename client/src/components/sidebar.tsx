import { Users, Home, BarChart2, Settings, ShoppingBag, TruckIcon, UserCircle } from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Users", href: "/management?tab=users", icon: UserCircle },
  { name: "Vendors", href: "/vendors", icon: TruckIcon },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default sidebarItems;