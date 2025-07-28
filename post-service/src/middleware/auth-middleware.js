const logger = require('../utils/logger')

const authenticateReq = async(req,res,next)=>{
  const userId = req.headers['x-user-id']

  if(!userId){
    logger.warn('access atempted without userID')
    return res.json({
        success:false,
        message : 'authentication required! please login to continue'
    })
  }

  req.user ={userId}
  next()

}

module.exports= authenticateReq