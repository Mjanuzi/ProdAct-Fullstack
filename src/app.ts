import { randomBytes } from "crypto";
import cors from "cors";
import express from "express";
import session from "express-session";
import { authRouter } from "./routes/auth";
import { healthRouter } from "./routes/health";
import { productsRouter } from "./routes/products";
import { adminProductsRouter } from "./routes/adminProducts";

export const app = express();

const isProduction = process.env.NODE_ENV === "production";
const sessionSecretFromEnv = process.env.SESSION_SECRET;

if (!sessionSecretFromEnv && isProduction) {
  throw new Error(
    "SESSION_SECRET environment variable must be set when NODE_ENV is 'production'",
  );
}

const sessionSecret = sessionSecretFromEnv ?? randomBytes(32).toString("hex");

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use(healthRouter);
app.use(authRouter);
app.use(productsRouter);
app.use(adminProductsRouter);

