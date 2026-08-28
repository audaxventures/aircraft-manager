"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CostEntryForm, type CostCategoryOption, type VendorOption } from "@/components/costs/cost-entry-form";

interface CostActionsProps {
  categories: CostCategoryOption[];
  vendors: VendorOption[];
}

function CostActions({ categories, vendors }: CostActionsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button className="rounded-full" onClick={() => setOpen(true)}>
        <Plus /> Add cost
      </Button>
      <CostEntryForm open={open} onOpenChange={setOpen} categories={categories} vendors={vendors} initial={null} />
    </>
  );
}

export { CostActions };
