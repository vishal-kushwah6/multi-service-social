 const logger =require('../utils/logger')
const {validationregistration ,validationlogin} = require('../utils/validation')
const User = require('../models/User')
const getratetoken = require('../utils/gen-token')
const Refreshtoken = require('../models/refreshtoken')


 async function  registeration (req,res){
    logger.info('registeration end point')
    try {

        
       const {error} =  validationregistration(req.body)  
        if (error) {
         logger.warn(`Validation error: ${error.details[0].message}`);
         return res.status(400).json({
         success: false,
         message: error.details[0].message,
          });
      }

            
        const {username , email , password} = req.body
        let user = await User.findOne({$or :[{email},{username}]})

        if(user){
          logger.warn('user already exist ')
             res.json({
                success : false,
                message : 'user already exist '
             });
        }


        user = new User({username,email,password})
        await user.save()

       logger.info('user saved  ', user._id)

       const {accesstoken , refreshtoken}= await getratetoken(user)


       res.json({
         success:true,
         message:"registration successful",
         accesstoken,
         refreshtoken
         
       })





    } catch (error) {
        logger.error('registration error occured ',error)
        res.json({
         success :false,
         message:'internal server error '
        })
    }
 }

async function login(req,res) {
  logger.info('login end point')

try {
    const {error} =  validationlogin(req.body)  

    if(error){
            logger.warn('validation error ',error.details[0].message)
             res.json({
                success : false,
                message : error.details[0].message
             });
        
            }

    const { email , password} = req.body
        let user = await User.findOne({email})

   if(!user){
          logger.warn('user doesnt exist ')
             res.json({
                success : false,
                message : 'user doesnt exist '
             });
        }
   
    const isValidPass = await user.comparepassword(password)
     if(!isValidPass){
          logger.warn('wrong password! ')
             res.json({
                success : false,
                message : 'wrong password! '
             });
        }

   const {accesstoken , refreshtoken}= await getratetoken(user)

   
       res.json({
         success:true,
         message:"login successful",
         accesstoken,
         refreshtoken,
         userID : user._id
         
       })
   
} catch (error) {
    logger.error('login error occured ',error)
        res.json({
         success :false,
         message:'internal server error '
        })
    }
}


const refreshtokenUser = async (req, res) => {
  logger.info('refreshtoken endpoint hit');

  try {
    const { refreshtoken } = req.body;
    if (!refreshtoken) {
      logger.warn('Missing refresh token');
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const storetoken = await Refreshtoken.findOne({ token: refreshtoken });
    if (!storetoken || storetoken.expireAt < new Date()) {
      logger.warn('Invalid or expired refresh token');
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or expired'
      });
    }

    const user = await User.findById(storetoken.user);
    if (!user) {
      logger.warn('User not found for given refresh token');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const { accesstoken: newAccessToken, refreshtoken: newRefreshToken } = await getratetoken(user);

    await Refreshtoken.deleteOne({ _id: storetoken._id });

    res.json({
      success: true,
      accesstoken: newAccessToken,
      refreshtoken: newRefreshToken
    });

  } catch (error) {
    logger.error('Refresh token error occurred', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const logout = async(req,res)=>{
      logger.info('refreshtoken end point')
      try {
         const {refreshtoken}= req.body
          if(!refreshtoken){
          logger.warn('refresh token is missng! ')
             res.json({
                success : false,
                message : 'refresh token is missng! '
             });
        }

        await Refreshtoken.deleteOne({token:refreshtoken})
        logger.info('refresh token deleted for logout ')

        res.json({
         success:true,
         message:'logout successful!'
         
        })

         
      } catch (error) {
         logger.error(' logout  error occured ',error)
        res.json({
         success :false,
         message:'internal server error '
        })
         
      }


}

   
   
 



 module.exports = {registeration,login,refreshtokenUser,logout}