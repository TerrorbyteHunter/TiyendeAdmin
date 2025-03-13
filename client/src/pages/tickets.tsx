import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TicketList } from "@/components/tickets/ticket-list";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusCircle } from "lucide-react";
import type { Vendor } from "@shared/schema";

export default function Tickets() {
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>(undefined);
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch vendors for the filter
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ['/api/vendors'],
  });

  // Fetch tickets with optional vendor filter
  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['/api/tickets', { vendorId: selectedVendor }],
    enabled: true,
  });

  // Handle vendor selection
  const handleVendorChange = (value: string) => {
    setSelectedVendor(value === "all" ? undefined : value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Ticket
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <Select value={selectedVendor || "all"} onValueChange={handleVendorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendorsLoading ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      vendors.map((vendor: Vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Route</label>
                <Select disabled value={selectedRoute || "all"} onValueChange={setSelectedRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Routes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routes</SelectItem>
                    {/* Routes will be populated based on selected vendor */}
                    <SelectItem value="loading" disabled>Select a vendor first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {ticketsLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <TicketList tickets={tickets} />
            )}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4 mt-4">
            {ticketsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <TicketList tickets={tickets.filter((ticket: any) => ticket.status === 'paid')} />
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {ticketsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <TicketList tickets={tickets.filter((ticket: any) => ticket.status === 'pending')} />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4 mt-4">
            {ticketsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
              </div>
            ) : (
              <TicketList tickets={tickets.filter((ticket: any) => ticket.status === 'cancelled' || ticket.status === 'refunded')} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}