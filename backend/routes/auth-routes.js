const router = require('express').Router();
const authController = require('../controller/authController');
const auth = require('../middleware/auth');

//register
router.get('/test', (req, res) => res.json({ msg: 'working' }));
router.post('/register', authController.register);
/*n*/
//login
router.post('/login', authController.login);
//logout
router.post('/logout', auth, authController.logout);
//refresh
router.get('/refresh', authController.refresh);


module.exports = router;

