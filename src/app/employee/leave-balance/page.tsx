"use client";

import { useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { LeaveDetailsDrawer } from "@/components/shared/leave-details-drawer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const balanceTypes = [
  { type: "Paid Leave", color: "#3b82f6" },
  { type: "Casual Leave", color: "#8b5cf6" },
  { type: "Sick Leave", color: "#ef4444" },
  { type: "Comp Off", color: "#f59e0b" },
] as const;

export default function LeaveBalancePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("Paid Leave");

  const balanceCards = balanceTypes.map(({ type, color }) => ({
    type,
    color,
    available: 0,
    consumed: 0,
    quota: 0,
    carryForward: 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Balance"
        description="View your available leave balances by type"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {balanceCards.map((card) => (
          <Card key={card.type}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: card.color }}
                />
                {card.type}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-2xl font-semibold text-primary">{card.available}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Consumed</p>
                  <p className="text-2xl font-semibold">{card.consumed}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Annual Quota</p>
                  <p className="text-sm font-medium">{card.quota}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Carry Forward</p>
                  <p className="text-sm font-medium">{card.carryForward}</p>
                </div>
              </div>
              <Progress value={card.quota > 0 ? (card.available / card.quota) * 100 : 0} />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSelectedType(card.type);
                  setDrawerOpen(true);
                }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <LeaveDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        leaveType={selectedType}
      />
    </div>
  );
}
