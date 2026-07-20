"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportsVendorFilterProps {
  vendors: { id: string; name: string }[];
}

function ReportsVendorFilter({ vendors }: ReportsVendorFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("vendor") ?? "all";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("vendor");
    else params.set("vendor", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Select value={vendorId} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-40" aria-label="Vendor">
        <SelectValue placeholder="All vendors" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All vendors</SelectItem>
        {vendors.map((v) => (
          <SelectItem key={v.id} value={v.id}>
            {v.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { ReportsVendorFilter };
