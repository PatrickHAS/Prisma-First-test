import { AuthService } from "../../services/AuthService";
import bcrypt from "bcrypt";

const mockFindByEmail = jest.fn();
const mockCreate = jest.fn();

jest.mock("../../repositories/UserRepository", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: mockFindByEmail,
    create: mockCreate,
  })),
}));

jest.mock("../../services/TokenService", () => ({
  TokenService: jest.fn().mockImplementation(() => ({
    generateToken: jest
      .fn()
      .mockImplementation(() => Promise.resolve("jwt-token-teste")),
  })),
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockImplementation(() => Promise.resolve("senha-hash")),
  compare: jest.fn().mockImplementation(() => Promise.resolve(false)),
}));

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve rejeitar registro com email já cadastrado", async () => {
    mockFindByEmail.mockResolvedValue({
      id: 1,
      email: "cliente@luxury.com",
    });

    const service = new AuthService();

    await expect(
      service.register({
        email: "cliente@luxury.com",
        password: "123456",
      }),
    ).rejects.toThrow("Email já cadastrado");

    expect(mockFindByEmail).toHaveBeenCalledWith("cliente@luxury.com");
  });
});

it("deve registrar um usuário com sucesso", async () => {
  mockFindByEmail.mockResolvedValue(null);

  mockCreate.mockResolvedValue({
    id: 1,
    email: "novo@luxury.com",
    name: "Novo Cliente",
    password: "senha-hash",
  });

  const service = new AuthService();

  const result = await service.register({
    email: "novo@luxury.com",
    password: "123456",
    name: "Novo Cliente",
  });

  expect(result).toEqual({
    id: 1,
    email: "novo@luxury.com",
    name: "Novo Cliente",
  });

  expect(mockCreate).toHaveBeenCalledWith({
    email: "novo@luxury.com",
    password: "senha-hash",
    name: "Novo Cliente",
  });
});

it("deve registrar usuário sem nome", async () => {
  mockFindByEmail.mockResolvedValue(null);

  mockCreate.mockResolvedValue({
    id: 2,
    email: "semnome@luxury.com",
    password: "senha-hash",
    name: null,
  });

  const service = new AuthService();

  const result = await service.register({
    email: "semnome@luxury.com",
    password: "123456",
  });

  expect(result).toEqual({
    id: 2,
    email: "semnome@luxury.com",
    name: null,
  });

  expect(mockCreate).toHaveBeenCalledWith({
    email: "semnome@luxury.com",
    password: "senha-hash",
  });
});

it("deve rejeitar login de usuário inexistente", async () => {
  mockFindByEmail.mockResolvedValue(null);

  const service = new AuthService();

  await expect(
    service.login({
      email: "naoexiste@luxury.com",
      password: "123456",
    }),
  ).rejects.toThrow("Email ou senha inválidos");

  expect(mockFindByEmail).toHaveBeenCalledWith("naoexiste@luxury.com");
});

it("deve rejeitar login com senha incorreta", async () => {
  mockFindByEmail.mockResolvedValue({
    id: 1,
    email: "cliente@luxury.com",
    password: "hash-da-senha",
    role: "USER",
  });

  const service = new AuthService();

  await expect(
    service.login({
      email: "cliente@luxury.com",
      password: "senha-errada",
    }),
  ).rejects.toThrow("Email ou senha inválidos");

  expect(mockFindByEmail).toHaveBeenCalledWith("cliente@luxury.com");
});

it("deve realizar login com sucesso", async () => {
  mockFindByEmail.mockResolvedValue({
    id: 1,
    email: "cliente@luxury.com",
    password: "hash-da-senha",
    role: "USER",
  });

  jest.mocked(bcrypt.compare).mockImplementation(() => Promise.resolve(true));

  const service = new AuthService();

  const result = await service.login({
    email: "cliente@luxury.com",
    password: "123456",
  });

  expect(result).toEqual({
    accessToken: "jwt-token-teste",
    user: {
      id: 1,
      email: "cliente@luxury.com",
      name: undefined,
      role: "USER",
    },
  });

  expect(mockFindByEmail).toHaveBeenCalledWith("cliente@luxury.com");
});
