import express from "express";
import cors from "cors";
import { Router } from "express";
import productRoutes from "./routes/ProductsRoutes";
import authRoutes from "./routes/AuthRoutes";
import { errorMiddleware } from "./middlewares/ErrorMiddleware";
import orderRoutes from "./routes/OrderRoutes";

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", Router());

app.use(productRoutes);
app.use(authRoutes);
app.use(orderRoutes);

app.use(errorMiddleware);

export default app;
