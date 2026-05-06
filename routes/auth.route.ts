import { Router } from "express";
import { register, login, cashierLogin } from "../controllers/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/cashier-login", cashierLogin);

export default router;
