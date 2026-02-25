import type { Session } from "next-auth";

export type CustomSession = Session & {
  accessToken?: string;
};
