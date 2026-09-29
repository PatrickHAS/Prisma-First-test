import "dotenv/config";

import { db } from "../prisma/db";

const categories = ["Anéis", "Pulseiras", "Colares", "Cordões"];

async function seedCategories() {
  const existingCategories = await db.orm.public.Category.all();

  for (const name of categories) {
    const alreadyExists = existingCategories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );

    if (alreadyExists) {
      console.log(`Categoria "${name}" já existe.`);
      continue;
    }

    const category = await db.orm.public.Category.create({
      name,
    });

    console.log(`Categoria criada: ${category.name}`);
  }

  console.log("");
  console.log("Seed de categorias concluído.");
}

seedCategories().catch((error) => {
  console.error("Erro ao criar categorias:");
  console.error(error);
  process.exit(1);
});
