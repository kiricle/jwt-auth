const Router = require('express').Router;
const userController = require('../controllers/userController');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

router.post(
    '/sign-up',
    body('email').isEmail(),
    body('password').isLength({ min: 5, max: 22 }),
    userController.signUp
);

router.post('/sign-in', userController.signIn);

router.post('/sign-out', userController.signOut);

router.get('/refresh', userController.refresh);

router.get('/users/current', authMiddleware, userController.getCurrentUser);

module.exports = router;
