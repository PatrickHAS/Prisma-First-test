import "dotenv/config";
import bcrypt from "bcrypt";

import { UserRepository } from "../repositories/UserRepository";

async function createAdmin() {
  const [, , email, name, password] = process.argv;

  if (!email || !name || !password) {
    console.error(
      'Uso: yarn admin:create "admin@email.com" "Nome do administrador" "Senha"',
    );

    process.exit(1);
  }

  if (password.length < 6) {
    console.error("A senha deve possuir pelo menos 6 caracteres.");
    process.exit(1);
  }

  const userRepository = new UserRepository();

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    console.error(`Já existe um usuário cadastrado com o email ${email}.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await userRepository.create({
    email,
    name,
    password: passwordHash,
    role: "ADMIN",
  });

  console.log("");
  console.log("Administrador criado com sucesso.");
  console.log(`ID: ${admin.id}`);
  console.log(`Nome: ${admin.name ?? "-"}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
}

createAdmin().catch((error) => {
  console.error("Erro ao criar administrador:");
  console.error(error);

  process.exit(1);
});
