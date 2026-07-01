"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { LeaveType } from "@/types";

export default function ApplyLeavePage() {
  const leaveTypes: LeaveType[] = [];
  const [halfDay, setHalfDay] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Leave request submitted successfully");
  };

  const balances = [
    { type: "Paid Leave", available: 0 },
    { type: "Casual Leave", available: 0 },
    { type: "Sick Leave", available: 0 },
    { type: "Comp Off", available: 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply Leave"
        description="Submit a new leave request"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leave Application Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.slice(0, 4).map((lt) => (
                      <SelectItem key={lt.id} value={lt.id}>{lt.leaveName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" required />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" required />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Half Day</p>
                  <p className="text-xs text-muted-foreground">Apply for half day leave</p>
                </div>
                <Switch checked={halfDay} onCheckedChange={setHalfDay} />
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea placeholder="Provide reason for leave..." rows={4} required />
              </div>

              <div className="space-y-2">
                <Label>Attachment</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="mr-2 size-4" />
                    Upload File
                  </Button>
                  <span className="text-xs text-muted-foreground">Optional supporting document</span>
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Submit Leave Request
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Leave Balances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {balances.map((bal) => (
              <div key={bal.type} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">{bal.type}</span>
                <span className="text-lg font-semibold text-primary">{bal.available}</span>
              </div>
            ))}
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Summary</p>
              <p className="mt-1">
                Total available: {balances.reduce((sum, b) => sum + b.available, 0)} days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
