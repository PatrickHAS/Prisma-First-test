import { db } from "../prisma/db";

export class UserRepository {
  async findByEmail(email: string) {
    return db.orm.public.User.first({ email });
  }

  async create(data: {
    email: string;
    password: string;
    name?: string;
    username?: string;
    role?: string;
  }) {
    return db.orm.public.User.create(data);
  }
}
