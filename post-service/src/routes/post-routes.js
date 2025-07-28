 const {createpost,getallpost,getpost,deletepost}=require('../controller/post-controller')
 const express = require('express');
 const authenticateReq = require('../middleware/auth-middleware');

  const router =  express.Router()
  
  router.use(authenticateReq)
  router.post('/create-post',createpost)
  router.get('/getallpost',getallpost )
  router.get('/:id',getpost )
  router.delete('/:id',deletepost )




  module.exports = router