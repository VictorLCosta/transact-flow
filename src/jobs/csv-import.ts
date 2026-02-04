import fs from "node:fs";

import csvParser from "csv-parser";
import { z } from "zod";

import { prisma } from "@/client";
import type { ImportErrorCreateManyInput, TransactionCreateManyInput } from "@/generated/prisma/models";

export const TransactionRowSchema = z.object({
  amount: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), {
      message: "Amount must be a valid number",
    }),

  currency: z.string().trim().min(1, "Currency is required"),

  description: z.string().optional().default(""),
});

type TransactionRow = z.infer<typeof TransactionRowSchema>;

const processCsvTransactions = async (jobId: string, projectId: string, filePath: string): Promise<void> => {
  const transactions: TransactionCreateManyInput[] = [];
  const errors: ImportErrorCreateManyInput[] = [];

  let currentLine = 1;

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: ["amount", "currency", "description"], skipLines: 1, separator: ";" }))
      .on("data", (row: TransactionRow) => {
        currentLine++;

        const result = TransactionRowSchema.safeParse(row);
        if (!result.success) {
          errors.push({
            lineText: JSON.stringify(row),
            lineNumber: currentLine,
            errorMessage: result.error.issues.map((i) => JSON.stringify(i)).join("; "),
            importJobId: jobId,
          });
          return;
        }

        transactions.push({
          ...result.data,
          importJobId: jobId,
          projectId,
        });
      })
      .on("error", reject)
      .on("end", resolve);
  });

  await prisma.transaction.createMany({
    data: transactions,
  });

  await prisma.importError.createMany({
    data: errors,
  });
};

export default processCsvTransactions;
