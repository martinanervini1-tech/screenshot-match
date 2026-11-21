import { queryOptions } from "@tanstack/react-query";
import { getDemoDesk } from "./desk.functions";
export const demoDeskOptions = queryOptions({
  queryKey: ["desk", "demo"],
  queryFn: () => getDemoDesk(),
  staleTime: 60_000,
});
