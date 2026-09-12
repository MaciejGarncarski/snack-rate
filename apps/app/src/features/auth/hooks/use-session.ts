import { useSuspenseQuery } from "@tanstack/react-query";

import { sessionQueryOptions } from "#/features/auth/queries/session.query-options";

export function useSession() {
  return useSuspenseQuery(sessionQueryOptions());
}
