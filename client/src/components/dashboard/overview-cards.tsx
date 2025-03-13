import { 
  Ticket, 
  DollarSign, 
  Users, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: "bookings" | "revenue" | "vendors" | "routes";
  change?: {
    type: "increase" | "decrease" | "neutral";
    value: string;
    text: string;
  };
}

const CardIcon = ({ type }: { type: StatsCardProps["icon"] }) => {
  switch (type) {
    case "bookings":
      return (
        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
          <Ticket className="h-6 w-6 text-primary" />
        </div>
      );
    case "revenue":
      return (
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <DollarSign className="h-6 w-6 text-green-600" />
        </div>
      );
    case "vendors":
      return (
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
          <Users className="h-6 w-6 text-amber-600" />
        </div>
      );
    case "routes":
      return (
        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
          <MapPin className="h-6 w-6 text-purple-600" />
        </div>
      );
    default:
      return null;
  }
};

const ChangeIndicator = ({ change }: { change?: StatsCardProps["change"] }) => {
  if (!change) return null;
  
  let Icon;
  let textColor;
  
  switch (change.type) {
    case "increase":
      Icon = TrendingUp;
      textColor = "text-green-500";
      break;
    case "decrease":
      Icon = TrendingDown;
      textColor = "text-red-500";
      break;
    case "neutral":
      Icon = Minus;
      textColor = "text-amber-500";
      break;
  }
  
  return (
    <div className="mt-4 flex items-center text-sm">
      <span className={`${textColor} font-medium flex items-center`}>
        <Icon className="h-5 w-5 mr-1" />
        {change.value}
      </span>
      <span className="text-gray-500 ml-2">{change.text}</span>
    </div>
  );
};

export function StatsCard({ title, value, icon, change }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
          </div>
          <CardIcon type={icon} />
        </div>
        <ChangeIndicator change={change} />
      </CardContent>
    </Card>
  );
}

interface OverviewCardsProps {
  stats: {
    totalBookings: number;
    totalRevenue: number;
    activeVendors: number;
    activeRoutes: number;
  };
  isLoading?: boolean;
}

export function OverviewCards({ stats, isLoading = false }: OverviewCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-24 animate-pulse bg-gray-200 rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Bookings"
        value={stats.totalBookings.toLocaleString()}
        icon="bookings"
        change={{
          type: "increase",
          value: "12.5%",
          text: "from last month"
        }}
      />
      
      <StatsCard
        title="Total Revenue"
        value={`K${stats.totalRevenue.toLocaleString()}`}
        icon="revenue"
        change={{
          type: "increase",
          value: "18.2%",
          text: "from last month"
        }}
      />
      
      <StatsCard
        title="Active Vendors"
        value={stats.activeVendors}
        icon="vendors"
        change={{
          type: "increase",
          value: "4 new",
          text: "this month"
        }}
      />
      
      <StatsCard
        title="Active Routes"
        value={stats.activeRoutes}
        icon="routes"
        change={{
          type: "neutral",
          value: "No change",
          text: "from last week"
        }}
      />
    </div>
  );
}
