"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sortTypes } from "@/constants";

const Sort = () => {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || sortTypes[0].value;

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(`${path}?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleSort} defaultValue={current}>
      <SelectTrigger className="h-9 w-full sm:w-[200px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortTypes.map((sort) => (
          <SelectItem key={sort.value} value={sort.value}>
            {sort.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Sort;
