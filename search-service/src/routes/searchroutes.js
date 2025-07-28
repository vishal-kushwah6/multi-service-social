const express = require('express');
const {searchPost} = require('../controller/search-controller')
const authmiddleware = require('../middleware/auth-middleware')
const router = express.Router();


router.use(authmiddleware)

router.get('/post',searchPost)


module.exports = router