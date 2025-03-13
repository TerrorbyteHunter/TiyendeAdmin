import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Calendar } from "lucide-react";

export default function Analytics() {
  const [period, setPeriod] = useState("30");
  const [reportType, setReportType] = useState("revenue");
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });
  
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  const generateReport = () => {
    // In a real implementation, this would generate and download a report
    alert(`Generating ${reportType} report for the last ${period} days`);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Analytics & Reports</h2>
        <p className="mt-1 text-sm text-gray-500">View performance metrics and generate reports.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <Tabs defaultValue="revenue" onValueChange={setReportType} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={generateReport}>
            <Download className="h-5 w-5 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {dashboardData?.totalBookings.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                K{dashboardData?.totalRevenue.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Average Ticket Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                K{dashboardData?.totalBookings 
                  ? Math.round(dashboardData?.totalRevenue / dashboardData?.totalBookings) 
                  : 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {dashboardData?.activeRoutes}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Revenue Tab Content */}
      <TabsContent value="revenue" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Revenue chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show revenue trends over the selected time period ({period} days).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Vendor</CardTitle>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Revenue by vendor chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show a pie chart of revenue distribution across vendors.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Route</CardTitle>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Revenue by route chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show the top performing routes by revenue.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      {/* Bookings Tab Content */}
      <TabsContent value="bookings" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Bookings Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Bookings trend chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show booking volume trends over the selected time period ({period} days).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Booking status chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show the distribution of booking statuses (paid, pending, refunded, cancelled).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Popular Travel Days</CardTitle>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Popular days chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show which days of the week are most popular for travel.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      {/* Vendors Tab Content */}
      <TabsContent value="vendors" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Vendor Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Vendor performance chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would compare performance metrics across vendors.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-60" />
              ) : (
                vendors.length > 0 ? (
                  <div className="space-y-4">
                    {vendors.slice(0, 5).map((vendor: any, index: number) => (
                      <div key={vendor.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">{index + 1}.</span>
                          <span>{vendor.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {Math.floor(Math.random() * 500) + 100} bookings
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center h-60 flex items-center justify-center">
                    <p>No vendor data available</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Vendor Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Vendor status chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show the distribution of vendor statuses (active, inactive, pending).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      {/* Routes Tab Content */}
      <TabsContent value="routes" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Route Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Route performance chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show booking and revenue metrics for popular routes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Routes</CardTitle>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Popular routes chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show the top routes by number of bookings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Route Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <div className="text-gray-400 text-center">
                  <p>Occupancy rate chart would be displayed here</p>
                  <p className="text-sm mt-2">
                    This would show the average occupancy rate for each route.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </div>
  );
}
