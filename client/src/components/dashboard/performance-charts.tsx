import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

// Revenue chart placeholder
export function RevenueChart({ isLoading = false }) {
  const [timeframe, setTimeframe] = useState("7");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-64">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center">
            <div className="text-gray-400 text-sm">
              Revenue chart will be displayed here
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Booking distribution chart placeholder
export function BookingDistributionChart({ isLoading = false }) {
  const [timeframe, setTimeframe] = useState("30");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Booking Distribution by Vendor</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px] h-8">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-64">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="w-full h-64 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center">
            <div className="text-gray-400 text-sm">
              Vendor distribution chart will be displayed here
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function PerformanceCharts({ isLoading = false }) {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-800">Performance Analytics</h3>
        <p className="mt-1 text-sm text-gray-500">System performance and key metrics over time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart isLoading={isLoading} />
        <BookingDistributionChart isLoading={isLoading} />
      </div>
    </div>
  );
}
