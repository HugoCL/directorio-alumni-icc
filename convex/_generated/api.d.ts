/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as contacts from "../contacts.js";
import type * as emails from "../emails.js";
import type * as jobs from "../jobs.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_contact from "../lib/contact.js";
import type * as lib_jobs from "../lib/jobs.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_verification from "../lib/verification.js";
import type * as profiles from "../profiles.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";
import type * as verifications from "../verifications.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  contacts: typeof contacts;
  emails: typeof emails;
  jobs: typeof jobs;
  "lib/auth": typeof lib_auth;
  "lib/contact": typeof lib_contact;
  "lib/jobs": typeof lib_jobs;
  "lib/validators": typeof lib_validators;
  "lib/verification": typeof lib_verification;
  profiles: typeof profiles;
  seed: typeof seed;
  users: typeof users;
  verifications: typeof verifications;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
};
