import express from "express";
import cors from "cors";
import productRoutes from "./routes/ProductsRoutes";
import authRoutes from "./routes/AuthRoutes";
import { errorMiddleware } from "./middlewares/ErrorMiddleware";
import orderRoutes from "./routes/OrderRoutes";
import categoryRoutes from "./routes/CategoryRoutes";

const app = express();

app.disable("etag");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(productRoutes);
app.use(authRoutes);
app.use(orderRoutes);
app.use("/categories", categoryRoutes);

app.use(errorMiddleware);

export default app;
