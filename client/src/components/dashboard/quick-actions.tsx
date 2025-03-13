import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { UserPlus, MapPin, FileBarChart, Settings } from "lucide-react";

interface QuickActionProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  color: "blue" | "green" | "amber" | "purple";
}

const QuickAction = ({ href, icon, title, color }: QuickActionProps) => {
  const bgColor = {
    blue: "hover:border-primary hover:bg-blue-50",
    green: "hover:border-green-600 hover:bg-green-50",
    amber: "hover:border-amber-600 hover:bg-amber-50",
    purple: "hover:border-purple-600 hover:bg-purple-50",
  }[color];
  
  return (
    <Link href={href}>
      <a className={`text-center p-4 rounded-lg border border-gray-200 ${bgColor} transition-colors block`}>
        <div className="mx-auto h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-3">
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
      </a>
    </Link>
  );
};

export function QuickActions() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            href="/vendors?action=new"
            icon={<UserPlus className="h-6 w-6 text-primary" />}
            title="Add New Vendor"
            color="blue"
          />
          <QuickAction
            href="/routes?action=new"
            icon={<MapPin className="h-6 w-6 text-green-600" />}
            title="Add New Route"
            color="green"
          />
          <QuickAction
            href="/analytics"
            icon={<FileBarChart className="h-6 w-6 text-amber-600" />}
            title="Generate Reports"
            color="amber"
          />
          <QuickAction
            href="/settings"
            icon={<Settings className="h-6 w-6 text-purple-600" />}
            title="System Settings"
            color="purple"
          />
        </div>
      </CardContent>
    </Card>
  );
}
