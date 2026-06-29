"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { leavePolicies, leaveTypes } from "@/data/mock-data";

export default function LeavePoliciesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Policies"
        description="Create and manage leave policies for employee groups"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Policy
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {leavePolicies.map((policy) => (
          <Card key={policy.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>{policy.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Users className="size-3.5" />
                {policy.assignedEmployees} employees assigned
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p><span className="font-medium text-foreground">Accrual:</span> {policy.accrualRules}</p>
              <p><span className="font-medium text-foreground">Carry Forward:</span> {policy.carryForwardRules}</p>
              <p><span className="font-medium text-foreground">Probation:</span> {policy.probationRules}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Leave Policy</DialogTitle>
            <DialogDescription>Define rules for a group of employees</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Policy Name</Label>
              <Input placeholder="e.g. Standard Policy" />
            </div>
            <div className="space-y-2">
              <Label>Select Leave Types</Label>
              <div className="space-y-2 rounded-lg border p-3">
                {leaveTypes.slice(0, 4).map((lt) => (
                  <div key={lt.id} className="flex items-center gap-2">
                    <Checkbox id={lt.id} />
                    <label htmlFor={lt.id} className="text-sm">{lt.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accrual Rules</Label>
              <Textarea placeholder="Describe accrual rules..." />
            </div>
            <div className="space-y-2">
              <Label>Carry Forward Rules</Label>
              <Textarea placeholder="Describe carry forward rules..." />
            </div>
            <div className="space-y-2">
              <Label>Probation Rules</Label>
              <Textarea placeholder="Describe probation rules..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Create Policy</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
