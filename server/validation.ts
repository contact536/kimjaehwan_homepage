import { z } from "zod";
const label = z.string().trim().min(1).max(300);
const description = z.string().trim().max(4000);
const url = z.union([
  z.literal(""),
  z
    .url()
    .refine((value) => /^https?:\/\//i.test(value), "HTTP(S) URL required"),
]);
const catalog = z.object({
  name: label,
  field: z.string().max(500).optional(),
  fields: z.array(label).min(1).max(30),
  tier: label,
  tiers: z.array(label).min(1).max(10),
});
export const schemas = {
  research: z.object({name:label,subtitle:label,summary:description.min(1),body:description.min(1)}).strict(),
  conferences: catalog
    .extend({ acceptance: z.string().max(100), format: z.string().max(100) })
    .strict(),
  journals: catalog
    .extend({
      abbr: z.string().max(100),
      publisher: label,
      host: z.string().max(300),
      if: z.string().max(100),
      strength: description,
    })
    .strict(),
  news: z.object({ name: description.min(1), date: label, url }).strict(),
  profile: z
    .object({
      name: label,
      tagline: label,
      identity: label,
      email: z.email(),
      publications: z.number().int().min(0).max(100000),
      projects: z.number().int().min(0).max(100000),
      presentations: z.number().int().min(0).max(100000),
      awards: z.number().int().min(0).max(100000),
    })
    .strict(),
};
export const kinds = z.enum(["conferences", "journals", "news", "profile", "research"]);
export const writeSchema = z
  .object({
    data: z.unknown(),
    revision: z.number().int().positive().optional(),
  })
  .strict();
