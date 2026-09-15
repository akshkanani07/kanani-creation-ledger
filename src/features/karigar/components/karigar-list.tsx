"use client";

import { useState } from "react";
import { KarigarCard } from "./karigar-card";
import { KarigarDeleteDialog } from "./karigar-delete-dialog";
import type { KarigarWithBalance } from "../types";

interface KarigarListProps {
  karigars: KarigarWithBalance[];
}

export function KarigarList({ karigars }: KarigarListProps) {
  const [deleteTarget, setDeleteTarget] = useState<KarigarWithBalance | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteClick = (karigar: KarigarWithBalance) => {
    setDeleteTarget(karigar);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {karigars.map((karigar) => (
          <KarigarCard
            key={karigar.id}
            karigar={karigar}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <KarigarDeleteDialog
        karigar={deleteTarget}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}