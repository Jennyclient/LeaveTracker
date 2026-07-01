"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ManagerModal } from "@/components/shared/manager-modal";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllManagers } from "@/lib/managers";
import type { Manager } from "@/types";

export default function ManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingManager, setViewingManager] = useState<Manager | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchManagers() {
      try {
        const data = await getAllManagers();
        if (!cancelled) {
          setManagers(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load managers";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchManagers();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Managers"
        description="View managers and their team members"
      />

      <div className="rounded-xl border bg-card">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manager Name</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.length === 0 ? (
                <TableEmptyRow colSpan={3} message="No managers found" />
              ) : (
                managers.map((mgr) => (
                  <TableRow key={mgr.id} className="group">
                    <TableCell className="font-medium">{mgr.name}</TableCell>
                    <TableCell>{mgr.teamSize}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-60 transition-opacity group-hover:opacity-100"
                        aria-label={`View ${mgr.name}`}
                        onClick={() => setViewingManager(mgr)}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <ManagerModal
        manager={viewingManager}
        onClose={() => setViewingManager(null)}
      />
    </div>
  );
}
