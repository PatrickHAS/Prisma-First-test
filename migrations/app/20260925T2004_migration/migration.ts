#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/6d857cb539072ce28b74a968462e3f7540f918aabfc7602d30a4f582ade060c6/contract";
import endContract from "../../snapshots/6d857cb539072ce28b74a968462e3f7540f918aabfc7602d30a4f582ade060c6/contract.json" with { type: "json" };
import type { Contract as Start } from "../../snapshots/7d595fbc1a567fc2c219ac5e4ded4163d1370d3cebfec6a03d0df197ba1d95d4/contract";
import startContract from "../../snapshots/7d595fbc1a567fc2c219ac5e4ded4163d1370d3cebfec6a03d0df197ba1d95d4/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  col,
  placeholder,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: "public",
        table: "user",
        column: col("password", "text", {
          codecRef: { codecId: "pg/text@1" },
        }),
      }),

      this.setNotNull({
        schema: "public",
        table: "user",
        column: "password",
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
