"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCircle,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { DeleteEmployeeDialog } from "@/components/shared/delete-employee-dialog";
import {
  EmployeeModal,
  type EmployeeModalState,
} from "@/components/shared/employee-modal";
import { ActiveBadge } from "@/components/shared/status-badge";
import { TableEmptyRow } from "@/components/shared/table-empty-row";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  buildEmployeeListFilters,
  loadEmployeesPageData,
  type ManagerOption,
} from "@/lib/employees";
import { formatDate } from "@/lib/format";
import { getInitials } from "@/lib/user-utils";
import type { Employee } from "@/types";

export default function EmployeesPage() {
  const [list, setList] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState<EmployeeModalState | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [managerFilter, setManagerFilter] = useState("all");
  const managersRef = useRef<ManagerOption[]>([]);

  const loadData = useCallback(async (filter: string) => {
    setIsLoading(true);
    try {
      const apiFilters = buildEmployeeListFilters(filter, managersRef.current);
      const { employees, managers: managerList } =
        await loadEmployeesPageData(apiFilters);

      managersRef.current = managerList;
      setManagers(managerList);

      const nextList =
        filter === "unassigned"
          ? employees.filter(
              (emp) => !emp.managerId || emp.manager === "Unassigned"
            )
          : employees;

      setList(nextList);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load employees";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshEmployees = useCallback(async () => {
    await loadData(managerFilter);
  }, [loadData, managerFilter]);

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialEmployees() {
      try {
        const { employees, managers: managerList } = await loadEmployeesPageData();

        if (!cancelled) {
          managersRef.current = managerList;
          setManagers(managerList);
          setList(employees);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load employees";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchInitialEmployees();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleManagerFilterChange = (value: string) => {
    setManagerFilter(value);
    void loadData(value);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return list;

    return list.filter((emp) =>
      [emp.name, emp.email, emp.employeeId, emp.designation, emp.manager]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [list, search]);

  const emptyMessage = useMemo(() => {
    if (search.trim() && managerFilter !== "all") {
      return "No employees match your search and manager filter";
    }
    if (search.trim()) {
      return "No employees match your search";
    }
    if (managerFilter === "unassigned") {
      return "No employees without a manager";
    }
    if (managerFilter !== "all") {
      return "No employees found for this manager";
    }
    return "No employees found";
  }, [search, managerFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage employee records and leave policy assignments"
        actions={
          <Button onClick={() => setModal({ mode: "add" })}>
            <Plus className="mr-2 size-4" />
            Add Employee
          </Button>
        }
      />

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-background pl-8"
                disabled={isLoading}
              />
            </div>
            <Select
              value={managerFilter}
              onValueChange={handleManagerFilterChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full bg-background sm:w-52">
                <SelectValue placeholder="Filter by manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All managers</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isLoading && (
            <Badge variant="secondary" className="w-fit shrink-0">
              {filtered.length} {filtered.length === 1 ? "employee" : "employees"}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmptyRow colSpan={7} message={emptyMessage} />
              ) : (
                filtered.map((emp) => (
                  <TableRow
                    key={emp.id}
                    className="group transition-colors hover:bg-primary/5"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(emp.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{emp.name}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {emp.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {emp.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-orange-200 bg-orange-50 font-normal text-orange-700 hover:bg-orange-100"
                      >
                        {emp.designation}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!emp.managerId || emp.manager === "Unassigned" ? (
                        <Button
                          variant="outline"
                          size="xs"
                          className="border-primary/30 bg-primary/5 text-primary shadow-none hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ mode: "edit", employee: emp });
                          }}
                        >
                          <UserPlus className="size-3" />
                          Add manager
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                          <UserCircle className="size-3.5 shrink-0 text-muted-foreground" />
                          {emp.manager}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(emp.joinDate)}
                    </TableCell>
                    <TableCell>
                      <ActiveBadge active={emp.status === "active"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-60 transition-opacity group-hover:opacity-100"
                          aria-label={`View ${emp.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ mode: "view", employee: emp });
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-60 transition-opacity group-hover:opacity-100"
                          aria-label={`Edit ${emp.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setModal({ mode: "edit", employee: emp });
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive opacity-60 transition-opacity group-hover:opacity-100 hover:text-destructive"
                          aria-label={`Delete ${emp.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleting(emp);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <EmployeeModal
        state={modal}
        onClose={() => setModal(null)}
        onSuccess={() => {
          void refreshEmployees();
        }}
        onEdit={(employee) => setModal({ mode: "edit", employee })}
      />

      <DeleteEmployeeDialog
        employee={deleting}
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        onDeleted={() => {
          if (
            modal &&
            modal.mode !== "add" &&
            modal.employee.id === deleting?.id
          ) {
            setModal(null);
          }
          void refreshEmployees();
        }}
      />
    </div>
  );
}
