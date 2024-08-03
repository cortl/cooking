import { z } from "zod";
import fs from "fs";
import { TAGS, TIME_LABELS, TIME_MEASUREMENTS } from "../constants";

const imageValidator = z
  .string()
  .min(1)
  .refine(
    (value: string) => {
      if (!value.includes(".webp")) {
        return false;
      }
      const exists = fs.existsSync(`images/${value}`);
      return exists;
    },
    (value: string) => {
      if (!value.includes(".webp")) {
        return { message: `${value} is not a webp file` };
      }
      return { message: `${value} file does not exist` };
    },
  );

const FORBIDDEN_TITLE_WORDS = ["bravetart", "best", "recipe", "delicious"].map(
  (word) => word.toUpperCase(),
);

const titleValidator = z
  .string()
  .min(1)
  .refine(
    (value) => {
      if (typeof value !== "string") {
        return false;
      }
      const matches = value
        .split(" ")
        .filter((word) => FORBIDDEN_TITLE_WORDS.includes(word.toUpperCase()));
      return matches.length == 0;
    },
    (value) => {
      const matches = value
        .split(" ")
        .filter((word) => FORBIDDEN_TITLE_WORDS.includes(word.toUpperCase()));
      return {
        message: `Recipe contains forbidden word(s): ${matches.join(", ")}`,
      };
    },
  );

const slugValidator = z
  .string()
  .min(1)
  .refine(
    (value: string) => {
      const exists = fs.existsSync(`lib/${value}.json`);
      return exists;
    },
    (value: string) => ({
      message: `${value} slug does not exist.`,
    }),
  );

const schema = z.object({
  title: titleValidator,
  servings: z.number(),
  rating: z.number().int(),
  slug: slugValidator,
  source: z.object({
    name: z.string().min(1),
    url: z.string().url(),
  }),
  createdDate: z.string().optional(),
  instructions: z.array(z.string().nonempty()).min(1),
  notes: z.array(z.string().nonempty()),
  archived: z.boolean().optional(),
  ingredients: z.array(
    z.object({
      category: z.string().optional().default(""), // Allow empty strings
      items: z.array(z.string().nonempty()),
    }),
  ),
  tags: z
    .array(
      z
        .string()
        .min(1)
        .refine((val) => TAGS.includes(val), {
          message: "Invalid tag",
        }),
    )
    .nonempty(),
  time: z
    .array(
      z.object({
        label: z.string().refine((val) => TIME_LABELS.includes(val), {
          message: "Invalid time label",
        }),
        units: z.array(
          z.object({
            measurement: z.number().positive(),
            label: z.string().refine((val) => TIME_MEASUREMENTS.includes(val), {
              message: "Invalid time measurement label",
            }),
          }),
        ),
      }),
    )
    .min(1),
  image: imageValidator.optional(),
  related: z.array(slugValidator).optional(),
});

export type Recipe = z.infer<typeof schema>;

export { schema };
