import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import { TokenService } from "./TokenService";
import { AppError } from "../errors/AppError";

export class AuthService {
  private userRepository: UserRepository;
  private tokenService: TokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.tokenService = new TokenService();
  }

  async register(data: { email: string; password: string; name?: string }) {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email já cadastrado", 400);
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
      throw new AppError("Email ou senha inválidos", 401);
    }

    const passwordIsValid = await bcrypt.compare(data.password, user.password);

    if (!passwordIsValid) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    const accessToken = await this.tokenService.generateToken(
      user.id,
      user.role,
    );

    return {
      accessToken,
    };
  }
}
