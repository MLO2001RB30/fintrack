import "server-only";

import { Inngest } from "inngest";

import { getEnv } from "@/lib/server/env";

export const inngest = new Inngest({
  id: "fintrack",
  eventKey: getEnv().INNGEST_EVENT_KEY,
});
