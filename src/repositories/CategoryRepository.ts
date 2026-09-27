import { db } from "../prisma/db";

export class CategoryRepository {
  async findAll() {
    return db.orm.public.Category.orderBy((category) =>
      category.name.asc(),
    ).all();
  }
}
