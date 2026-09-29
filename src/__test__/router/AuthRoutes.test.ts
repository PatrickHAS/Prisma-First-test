import express from "express";
import request from "supertest";
import { AppError } from "../../errors/AppError";

const mockRegister = jest.fn();
const mockLogin = jest.fn();

jest.mock("../../services/AuthService", () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    register: (...args: unknown[]) => mockRegister(...args),
    login: (...args: unknown[]) => mockLogin(...args),
  })),
}));

import authRoutes from "../../routes/AuthRoutes";

const app = express();

app.use(express.json());
app.use(authRoutes);

describe("AuthRoutes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve registrar um usuário com dados válidos", async () => {
    const registerData = {
      email: "novo@luxury.com",
      password: "123456",
    };

    const createdUser = {
      id: 3,
      email: "novo@luxury.com",
      role: "USER",
    };

    mockRegister.mockResolvedValue(createdUser);

    const response = await request(app)
      .post("/auth/register")
      .send(registerData);

    expect(mockRegister).toHaveBeenCalledWith(registerData);

    expect(response.status).toBe(201);

    expect(response.body).toEqual(createdUser);
  });

  it("deve bloquear registro com dados inválidos", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "email-invalido",
      password: "",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Dados inválidos");

    expect(response.body.errors).toBeDefined();

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("deve retornar 409 quando o e-mail já estiver cadastrado", async () => {
    const registerData = {
      email: "cliente@luxury.com",
      password: "123456",
    };

    mockRegister.mockRejectedValue(new AppError("E-mail já cadastrado", 409));

    const response = await request(app)
      .post("/auth/register")
      .send(registerData);

    expect(mockRegister).toHaveBeenCalledWith(registerData);

    expect(response.status).toBe(409);

    expect(response.body).toEqual({
      message: "E-mail já cadastrado",
    });
  });

  it("deve realizar login com credenciais válidas", async () => {
    const loginData = {
      email: "cliente@luxury.com",
      password: "123456",
    };

    const loginResponse = {
      user: {
        id: 1,
        email: "cliente@luxury.com",
        role: "ADMIN",
      },
      token: "jwt-token-test",
    };

    mockLogin.mockResolvedValue(loginResponse);

    const response = await request(app).post("/auth/login").send(loginData);

    expect(mockLogin).toHaveBeenCalledWith(loginData);

    expect(response.status).toBe(200);

    expect(response.body).toEqual(loginResponse);
  });

  it("deve bloquear login com dados inválidos", async () => {
    const response = await request(app).post("/auth/login").send({
      email: "email-invalido",
      password: "",
    });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Dados inválidos");

    expect(response.body.errors).toBeDefined();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando as credenciais forem inválidas", async () => {
    const loginData = {
      email: "cliente@luxury.com",
      password: "senha-errada",
    };

    mockLogin.mockRejectedValue(new AppError("E-mail ou senha inválidos", 401));

    const response = await request(app).post("/auth/login").send(loginData);

    expect(mockLogin).toHaveBeenCalledWith(loginData);

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "E-mail ou senha inválidos",
    });
  });
});
