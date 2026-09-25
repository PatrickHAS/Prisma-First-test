import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: { email: string; password: string; name?: string }) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email já cadastrado");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      email: data.email,
      password: passwordHash,
      ...(data.name !== undefined && { name: data.name }),
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async login(data: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new Error("Email ou senha inválidos");
    }

    const passwordIsValid = await bcrypt.compare(data.password, user.password);

    if (!passwordIsValid) {
      throw new Error("Email ou senha inválidos");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
