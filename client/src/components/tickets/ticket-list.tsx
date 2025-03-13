import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Ticket } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  FileEdit, 
  CreditCard, 
  AlertCircle,
  Clock,
  CheckCircle,
  RotateCcw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

interface TicketListProps {
  vendorId?: number;
  routeId?: number;
}

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  switch (status) {
    case "paid":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" /> Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "refunded":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          <RotateCcw className="mr-1 h-3 w-3" /> Refunded
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          <AlertCircle className="mr-1 h-3 w-3" /> Cancelled
        </Badge>
      );
    default:
      return null;
  }
};

export function TicketList({ vendorId, routeId }: TicketListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [updateStatusTicket, setUpdateStatusTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState<Ticket["status"]>("paid");
  
  // Build query key based on filters
  const queryKey = ['/api/tickets'];
  if (vendorId) queryKey.push(vendorId.toString());
  if (routeId) queryKey.push(routeId.toString());
  
  // Build query params
  let queryParams = '';
  if (vendorId) queryParams += `vendorId=${vendorId}`;
  if (routeId) {
    if (queryParams) queryParams += '&';
    queryParams += `routeId=${routeId}`;
  }
  
  const apiUrl = queryParams ? `/api/tickets?${queryParams}` : '/api/tickets';
  
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: [apiUrl],
  });
  
  const { data: routes = [] } = useQuery({
    queryKey: ['/api/routes'],
  });
  
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/vendors'],
  });
  
  const getRouteName = (routeId: number) => {
    const route = routes.find((r: any) => r.id === routeId);
    return route ? `${route.departure} → ${route.destination}` : `Route #${routeId}`;
  };
  
  const getVendorName = (vendorId: number) => {
    const vendor = vendors.find((v: any) => v.id === vendorId);
    return vendor ? vendor.name : `Vendor #${vendorId}`;
  };
  
  const filteredTickets = tickets
    .filter((ticket: Ticket) => {
      const matchesSearch = 
        ticket.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ticket.customerPhone.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  
  const updateTicketStatus = async () => {
    if (!updateStatusTicket) return;
    
    try {
      const response = await apiRequest(
        "PATCH", 
        `/api/tickets/${updateStatusTicket.id}`, 
        { status: newStatus }
      );
      
      const updatedTicket = await response.json();
      
      toast({
        title: "Ticket status updated",
        description: `Ticket #${updatedTicket.bookingReference} is now ${updatedTicket.status}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      setUpdateStatusTicket(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="max-w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Route & Vendor</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket: Ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium text-primary">
                      #{ticket.bookingReference}
                    </TableCell>
                    <TableCell>
                      <div>{ticket.customerName}</div>
                      <div className="text-sm text-muted-foreground">{ticket.customerPhone}</div>
                    </TableCell>
                    <TableCell>
                      <div>{getRouteName(ticket.routeId)}</div>
                      <div className="text-sm text-muted-foreground">{getVendorName(ticket.vendorId)}</div>
                    </TableCell>
                    <TableCell>{format(new Date(ticket.travelDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell>K{ticket.amount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setViewTicket(ticket)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUpdateStatusTicket(ticket)}>
                            <FileEdit className="mr-2 h-4 w-4" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* View Ticket Dialog */}
        <Dialog open={viewTicket !== null} onOpenChange={(open) => !open && setViewTicket(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ticket Details</DialogTitle>
              <DialogDescription>
                Booking reference: #{viewTicket?.bookingReference}
              </DialogDescription>
            </DialogHeader>
            
            {viewTicket && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                    <p className="text-base">{viewTicket.customerName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                    <p className="text-base">{viewTicket.customerPhone}</p>
                    {viewTicket.customerEmail && <p className="text-sm text-gray-500">{viewTicket.customerEmail}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Route</h4>
                    <p className="text-base">{getRouteName(viewTicket.routeId)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Vendor</h4>
                    <p className="text-base">{getVendorName(viewTicket.vendorId)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Travel Date</h4>
                    <p className="text-base">{format(new Date(viewTicket.travelDate), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Seat Number</h4>
                    <p className="text-base">{viewTicket.seatNumber}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                    <p className="text-base">K{viewTicket.amount}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <StatusBadge status={viewTicket.status} />
                  </div>
                </div>
                
                {viewTicket.paymentMethod && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                      <p className="text-base capitalize">{viewTicket.paymentMethod.replace('_', ' ')}</p>
                    </div>
                    {viewTicket.paymentReference && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Payment Reference</h4>
                        <p className="text-base">{viewTicket.paymentReference}</p>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Booking Date</h4>
                  <p className="text-base">{format(new Date(viewTicket.bookingDate), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setViewTicket(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Update Status Dialog */}
        <Dialog open={updateStatusTicket !== null} onOpenChange={(open) => !open && setUpdateStatusTicket(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update Ticket Status</DialogTitle>
              <DialogDescription>
                Change the status for ticket #{updateStatusTicket?.bookingReference}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-right font-medium col-span-1">Status:</p>
                <div className="col-span-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setUpdateStatusTicket(null)}
              >
                Cancel
              </Button>
              <Button 
                onClick={updateTicketStatus}
                className="bg-primary hover:bg-primary/90"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash2, Eye } from "lucide-react";
import type { Ticket } from "@shared/schema";

interface TicketListProps {
  tickets: Ticket[];
}

const TicketStatusBadge = ({ status }: { status: Ticket["status"] }) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "refunded":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Refunded</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    default:
      return null;
  }
};

export function TicketList({ tickets }: TicketListProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No tickets found.
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.bookingReference}</TableCell>
                <TableCell>
                  <div className="font-medium">{ticket.customerName}</div>
                  <div className="text-sm text-gray-500">{ticket.customerPhone}</div>
                </TableCell>
                <TableCell>
                  {/* We would need to fetch route details to display here */}
                  {ticket.routeId}
                </TableCell>
                <TableCell>{formatDate(ticket.travelDate)}</TableCell>
                <TableCell>K{(ticket.amount / 100).toFixed(2)}</TableCell>
                <TableCell>
                  <TicketStatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
