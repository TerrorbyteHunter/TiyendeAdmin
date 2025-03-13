import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, CheckCircle, Clock, AlertCircle, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivitiesProps {
  activities: Activity[];
  isLoading?: boolean;
}

const ActivityIcon = ({ action }: { action: string }) => {
  // Determine icon based on activity type
  if (action.includes("added") || action.includes("created")) {
    return (
      <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
        <PlusCircle className="h-5 w-5 text-primary" />
      </span>
    );
  } else if (action.includes("completed")) {
    return (
      <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-5 w-5 text-green-600" />
      </span>
    );
  } else if (action.includes("pending") || action.includes("maintenance")) {
    return (
      <span className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
        <Clock className="h-5 w-5 text-amber-600" />
      </span>
    );
  } else if (action.includes("alert") || action.includes("error")) {
    return (
      <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="h-5 w-5 text-red-600" />
      </span>
    );
  } else {
    return (
      <span className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
        <Eye className="h-5 w-5 text-purple-600" />
      </span>
    );
  }
};

export function RecentActivities({ activities = [], isLoading = false }: RecentActivitiesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <li key={activity.id} className="py-3">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  <ActivityIcon action={activity.action} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-800">
                    {activity.action}
                    {activity.details && typeof activity.details === 'object' && 
                      Object.entries(activity.details).map(([key, value]) => (
                        key !== "route" && key !== "vendorName" ? null : 
                        <span key={key} className="font-medium"> {value}</span>
                      ))
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-gray-200 px-6 py-3">
        <Button variant="ghost" className="w-full text-center text-sm text-primary">
          View All Activities
        </Button>
      </CardFooter>
    </Card>
  );
}
