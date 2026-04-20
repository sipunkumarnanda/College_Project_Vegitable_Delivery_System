import express from 'express';
import { register, login, getMe, logoutUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get("/me", getMe); 
router.post("/logout", logoutUser);

export default router;
