"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { balanceHistory } from "@/data/mock-data";
import { formatDate } from "@/lib/format";

interface LeaveDetailsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType: string;
}

export function LeaveDetailsDrawer({
  open,
  onOpenChange,
  leaveType,
}: LeaveDetailsDrawerProps) {
  const history = balanceHistory.filter((h) => h.leaveType === leaveType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{leaveType} Details</SheetTitle>
          <SheetDescription>
            View balance history and policy information
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="history" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="history" className="flex-1">
              Balance History
            </TabsTrigger>
            <TabsTrigger value="policy" className="flex-1">
              Policy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell
                        className={
                          item.change > 0 ? "text-emerald-600" : "text-red-600"
                        }
                      >
                        {item.change > 0 ? `+${item.change}` : item.change}
                      </TableCell>
                      <TableCell>{item.balance}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No history available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="policy" className="mt-4 space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Annual Quota</p>
                <p className="text-sm font-medium">18 days per year</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Accrual Rules</p>
                <p className="text-sm">1.5 days credited on the 1st of each month</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Carry Forward Rules</p>
                <p className="text-sm">Maximum 5 days can be carried to next year</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Expiry Rules</p>
                <p className="text-sm">Carried forward leaves expire by March 31</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Notice Period</p>
                <p className="text-sm">Minimum 3 working days advance notice required</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
