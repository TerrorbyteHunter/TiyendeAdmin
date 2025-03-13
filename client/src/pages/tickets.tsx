import { useState } from "react";
import { TicketList } from "@/components/tickets/ticket-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Tickets() {
  const [tabValue, setTabValue] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<number | undefined>(undefined);
  const [selectedRoute, setSelectedRoute] = useState<number | undefined>(undefined);
  
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  const { data: routes = [] } = useQuery({
    queryKey: ['/api/routes'],
  });
  
  const handleVendorChange = (value: string) => {
    if (value === "all") {
      setSelectedVendor(undefined);
    } else {
      setSelectedVendor(parseInt(value));
      // Reset route filter if it's not associated with this vendor
      if (selectedRoute) {
        const route = routes.find((r: any) => r.id === selectedRoute);
        if (route && route.vendorId !== parseInt(value)) {
          setSelectedRoute(undefined);
        }
      }
    }
  };
  
  const handleRouteChange = (value: string) => {
    if (value === "all") {
      setSelectedRoute(undefined);
    } else {
      setSelectedRoute(parseInt(value));
      // Auto-select vendor based on route
      const route = routes.find((r: any) => r.id === parseInt(value));
      if (route) {
        setSelectedVendor(route.vendorId);
      }
    }
  };
  
  // Filter routes based on selected vendor
  const filteredRoutes = selectedVendor 
    ? routes.filter((route: any) => route.vendorId === selectedVendor) 
    : routes;
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Tickets & Payments</h2>
        <p className="mt-1 text-sm text-gray-500">Manage bookings and payment statuses.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div>
          <Tabs 
            defaultValue="all" 
            value={tabValue}
            onValueChange={setTabValue}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="refunded">Refunded</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-4 mt-0">
              <TicketList vendorId={selectedVendor} routeId={selectedRoute} />
            </TabsContent>
            
            <TabsContent value="paid" className="pt-4 mt-0">
              <TicketList vendorId={selectedVendor} routeId={selectedRoute} />
            </TabsContent>
            
            <TabsContent value="pending" className="pt-4 mt-0">
              <TicketList vendorId={selectedVendor} routeId={selectedRoute} />
            </TabsContent>
            
            <TabsContent value="refunded" className="pt-4 mt-0">
              <TicketList vendorId={selectedVendor} routeId={selectedRoute} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 ml-auto">
          <Select
            value={selectedVendor ? selectedVendor.toString() : "all"}
            onValueChange={handleVendorChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Vendors</SelectLabel>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor: any) => (
                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select
            value={selectedRoute ? selectedRoute.toString() : "all"}
            onValueChange={handleRouteChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by route" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Routes</SelectLabel>
                <SelectItem value="all">All Routes</SelectItem>
                {filteredRoutes.map((route: any) => (
                  <SelectItem key={route.id} value={route.id.toString()}>
                    {route.departure} → {route.destination}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div> />
      </TabsContent>
    </div>
  );
}
