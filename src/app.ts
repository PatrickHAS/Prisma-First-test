import express from "express";
import cors from "cors";
import { Router } from "express";
import productRoutes from "./routes/products.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", Router());

app.use(productRoutes);
app.use(authRoutes);

export default app;
