#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/38ed5f254eae331fbc17b49f8563ce15e96db2bf9a675ed4b8d9c46d3b13d7d8/contract';
import startContract from '../../snapshots/38ed5f254eae331fbc17b49f8563ce15e96db2bf9a675ed4b8d9c46d3b13d7d8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e8b37f2503c13fb1f588922e1a6568da14246ac8c8684299602be48c9adc184f/contract';
import endContract from '../../snapshots/e8b37f2503c13fb1f588922e1a6568da14246ac8c8684299602be48c9adc184f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'product',
        column: col('imageUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
