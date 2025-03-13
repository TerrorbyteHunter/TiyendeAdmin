import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TicketList from "@/components/tickets/ticket-list";

export default function Tickets() {
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Select onValueChange={(value) => setSelectedVendor(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {/* Vendor items would be dynamically loaded here */}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select onValueChange={(value) => setSelectedRoute(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              {/* Route items would be dynamically loaded here */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="refunded">Refunded</TabsTrigger>
          </TabsList>
        </div>

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
  );
}