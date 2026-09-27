#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/38ed5f254eae331fbc17b49f8563ce15e96db2bf9a675ed4b8d9c46d3b13d7d8/contract';
import endContract from '../../snapshots/38ed5f254eae331fbc17b49f8563ce15e96db2bf9a675ed4b8d9c46d3b13d7d8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/6d857cb539072ce28b74a968462e3f7540f918aabfc7602d30a4f582ade060c6/contract';
import startContract from '../../snapshots/6d857cb539072ce28b74a968462e3f7540f918aabfc7602d30a4f582ade060c6/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('role', 'text', {
          notNull: true,
          default: lit('USER'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
