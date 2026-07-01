import { Inbox } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";

interface TableEmptyRowProps {
  colSpan: number;
  message?: string;
}

export function TableEmptyRow({
  colSpan,
  message = "No data found",
}: TableEmptyRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="h-48 whitespace-normal">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
