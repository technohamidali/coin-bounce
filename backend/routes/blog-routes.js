const router = require('express').Router();
const blogController = require('../controller/blogController');
const auth = require('../middleware/auth');


//blog routes
// create
router.post('/blog', auth, blogController.create);
//get all
router.get('/blog/all', auth, blogController.getAll);


//get by id
router.get('/blog/:id', auth, blogController.getById);
//update
router.put('/blog', auth, blogController.update);
//delete
router.delete('blog/:id', auth, blogController.delete);



module.exports = router;

// hammid me off krra hon session
// thanks bro