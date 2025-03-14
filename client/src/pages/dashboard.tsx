import { useQuery } from '@tanstack/react-query';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { RecentBookings } from '@/components/dashboard/recent-bookings';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { PerformanceCharts } from '@/components/dashboard/performance-charts';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Search } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });

  const handleGenerateReport = () => {
    // In a real implementation, this would generate and download a report
    alert('Report generation would be implemented here');
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 text-center w-full">Dashboard Overview</h2>
            <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with Tiyende today.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Search..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <Button onClick={handleGenerateReport} className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <OverviewCards 
          stats={{
            totalBookings: dashboardData?.totalBookings || 0,
            totalRevenue: dashboardData?.totalRevenue || 0,
            activeVendors: dashboardData?.activeVendors || 0,
            activeRoutes: dashboardData?.activeRoutes || 0,
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Bookings and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RecentBookings 
            bookings={dashboardData?.recentBookings || []}
            isLoading={isLoading}
          />
        </div>
        <div>
          <RecentActivities 
            activities={dashboardData?.recentActivities || []}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Performance Charts */}
      <PerformanceCharts isLoading={isLoading} />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}