const multer = require('multer')
const express = require('express');
const {uploadmedia,getallmedia} = require('../controller/media-controller')
const  authmiddleware = require('../middleware/auth-middleware');
const logger = require('../utils/logger');


const router = express.Router()

const upload = multer({
    storage : multer.memoryStorage(),
    limits:{
        fileSize : 5*1024*1024

    }
}).single("file")

router.use(authmiddleware)
router.post('/uploadMedia',(req,res,next)=>{
  upload(req,res,function(err){
    if(err instanceof multer.MulterError){
        logger.info('multer error occurs!',err)
        return res.json({
            success :true,
            message : 'multer error occur!',
            error : err
         });
    }else if (err){
        logger.info('some error occurs!',err)
        return res.json({
            success :false,
            message : 'some error occur!',
            error :err
         });

    
        }

        if(!req.file){
            return res.json({
                message: " file not found"
            })
        }
        next()


  })
}, uploadmedia);

router.get('/allmedia',getallmedia)


module.exports = router