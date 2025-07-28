 const {registeration,login,refreshtokenUser,logout}=require('../controller/identity-controller')
 const express = require('express');

 const router = express.Router()

 router.post('/register',registeration);
 router.post('/login',login)
 router.post('/refresh-token',refreshtokenUser)
 router.post('/logout',logout)


 

 module.exports = router
