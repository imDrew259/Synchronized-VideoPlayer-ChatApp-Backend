import express from 'express';
import { userLogin, userSignup, forgetpassword, resetpassword,changePassword } from '../controllers/userController.js';
import { isLoggedIn } from '../middlewares/validity.js';
import { myRoom } from '../controllers/roomController.js';

const router = express.Router();

router.post('/login', userLogin);
router.post('/signup', userSignup);
router.get('/myRoom',isLoggedIn, myRoom);
router.post('/forgetpassword', forgetpassword);
router.post('/resetpassword/:token', resetpassword)
router.post('/changepassword', isLoggedIn, changePassword);

export default router;