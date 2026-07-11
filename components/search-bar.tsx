"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { useDebounceCallback } from "@/hooks/use-debounce-callback";

export default function SearchBar({ initialValue, queryKey = "q", placeholder = "Search..." }: { initialValue: string; queryKey: string; placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(queryKey, value);
    } else {
      params.delete(queryKey);
    }

    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }

  const debouncedOnChange = useDebounceCallback(onChange, 300);

  return (
    <div className="flex items-center justify-center w-full pointer-events-auto">
      <InputGroup className="h-10 max-w-xl bg-input dark:bg-input">
        <InputGroupInput
          defaultValue={initialValue || ""}
          onChange={(e) => debouncedOnChange(e.target.value)}
          id="search"
          placeholder={placeholder}
        />
        <InputGroupAddon>
          <InputGroupText>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>
     </div>
  );
}
