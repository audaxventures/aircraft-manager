"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Combobox, type ComboboxOption } from "@/components/shared/combobox";

function PassengerPicker({ options }: { options: ComboboxOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const passengerId = searchParams.get("passengerId");

  return (
    <div className="max-w-sm">
      <Combobox
        options={options}
        value={passengerId}
        onChange={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          if (value) params.set("passengerId", value);
          else params.delete("passengerId");
          router.push(`${pathname}?${params.toString()}`);
        }}
        placeholder="Search a passenger…"
        searchPlaceholder="Type a name…"
      />
    </div>
  );
}

export { PassengerPicker };
