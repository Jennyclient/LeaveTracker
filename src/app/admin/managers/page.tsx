"use client";

import { useState } from "react";
import { Users } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
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
import { employees, managers } from "@/data/mock-data";

export default function ManagersPage() {
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const manager = managers.find((m) => m.id === selectedManager);
  const teamMembers = employees.filter((e) => e.managerId === selectedManager);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Managers"
        description="View managers and their team members"
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Manager Name</TableHead>
              <TableHead>Team Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((mgr) => (
              <TableRow key={mgr.id}>
                <TableCell className="font-medium">{mgr.name}</TableCell>
                <TableCell>{mgr.teamSize}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedManager(mgr.id)}
                  >
                    <Users className="mr-2 size-4" />
                    View Team
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!selectedManager} onOpenChange={() => setSelectedManager(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{manager?.name}&apos;s Team</SheetTitle>
            <SheetDescription>
              {teamMembers.length} members
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.designation}</TableCell>
                    <TableCell className="capitalize">{member.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
