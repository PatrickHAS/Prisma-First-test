import { AuthController } from "../../controllers/AuthController";
import { AppError } from "../../errors/AppError";

const mockRegister = jest.fn();
const mockLogin = jest.fn();

jest.mock("../../services/AuthService", () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    register: mockRegister,
    login: mockLogin,
  })),
}));

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve registrar um usuário com sucesso", async () => {
    const userData = {
      email: "cliente@luxury.com",
      password: "123456",
      name: "Cliente Luxury",
    };

    const createdUser = {
      id: 1,
      email: "cliente@luxury.com",
      name: "Cliente Luxury",
    };

    mockRegister.mockResolvedValue(createdUser);

    const req = {
      body: userData,
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;

    const controller = new AuthController();

    await controller.register(req, res);

    expect(mockRegister).toHaveBeenCalledWith(userData);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(createdUser);
  });
});

it("deve retornar 400 quando ocorrer um erro ao registrar o usuário", async () => {
  mockRegister.mockRejectedValue(new Error("Email já cadastrado"));

  const req = {
    body: {
      email: "cliente@luxury.com",
      password: "123456",
      name: "Cliente Luxury",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new AuthController();

  await controller.register(req, res);

  expect(mockRegister).toHaveBeenCalledWith(req.body);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "Email já cadastrado",
  });
});

it("deve retornar 500 quando ocorrer um erro interno ao registrar o usuário", async () => {
  mockRegister.mockRejectedValue("erro inesperado");

  const req = {
    body: {
      email: "cliente@luxury.com",
      password: "123456",
      name: "Cliente Luxury",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new AuthController();

  await controller.register(req, res);

  expect(mockRegister).toHaveBeenCalledWith(req.body);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Erro interno do servidor",
  });
});

it("deve realizar login com sucesso", async () => {
  const loginData = {
    email: "cliente@luxury.com",
    password: "123456",
  };

  const loginResult = {
    accessToken: "jwt-token",
  };

  mockLogin.mockResolvedValue(loginResult);

  const req = {
    body: loginData,
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new AuthController();

  await controller.login(req, res);

  expect(mockLogin).toHaveBeenCalledWith(loginData);

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith(loginResult);
});

it("deve retornar 401 quando o login for inválido", async () => {
  mockLogin.mockRejectedValue(new Error("Email ou senha inválidos"));

  const req = {
    body: {
      email: "cliente@luxury.com",
      password: "senha-errada",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new AuthController();

  await controller.login(req, res);

  expect(mockLogin).toHaveBeenCalledWith(req.body);

  expect(res.status).toHaveBeenCalledWith(401);

  expect(res.json).toHaveBeenCalledWith({
    message: "Email ou senha inválidos",
  });
});

it("deve retornar 500 quando ocorrer um erro interno ao realizar login", async () => {
  mockLogin.mockRejectedValue("erro inesperado");

  const req = {
    body: {
      email: "cliente@luxury.com",
      password: "123456",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new AuthController();

  await controller.login(req, res);

  expect(mockLogin).toHaveBeenCalledWith(req.body);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Erro interno do servidor",
  });
});

it("deve retornar 409 quando o email já estiver cadastrado", async () => {
  mockRegister.mockRejectedValue(new AppError("Email já cadastrado", 409));

  const req = {
    body: {
      email: "cliente@luxury.com",
      password: "123456",
      name: "Cliente Luxury",
    },
  } as any;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const controller = new AuthController();

  await controller.register(req, res);

  expect(res.status).toHaveBeenCalledWith(409);

  expect(res.json).toHaveBeenCalledWith({
    message: "Email já cadastrado",
  });
});
