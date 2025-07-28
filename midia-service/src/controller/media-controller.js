const express = require('express');
const logger = require('../utils/logger');
const {uploadMediaToCloudinary, deleteMedia} = require('../utils/cloudinary');
const Media = require('../model/media')



const uploadmedia = async (req, res) => {
    logger.info('uploadmedia endpoint hit');

    try {
      
        if (!req.file) {
            logger.error('No file found! please add file or try again');
            return res.status(400).json({
                success: false,
                message: "No file found! please add file or try again"
            });
        }
        const { originalname: OriginalName, mimetype: mimeType, buffer } = req.file;
        const userId = req.user.userId;

        logger.info(`File details: name = ${OriginalName}, type = ${mimeType}`);
        logger.info(`Uploading to cloudinary...`);

        const uploadresult = await uploadMediaToCloudinary(req.file);

        logger.info(`Upload successful! publicId: ${uploadresult.public_id}`);

        const newmedia = new Media({
            publicId: uploadresult.public_id,
            OriginalName,
            mimeType,
            url: uploadresult.secure_url,
            userId
        });

        await newmedia.save();

        res.json({
            success: true,
            mediaId: newmedia._id,
            url: newmedia.url,
            message: 'Media upload successful!'
        });

    } catch (error) {
        logger.error('Internal server error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred"
        });
    }
};

async function getallmedia(req,res){
    try {

        const result = await Media.find({})

        res.json({
            success : true ,
            result : result
        })

        
    } catch (error) {
        logger.error('error fetching media,:', error);
        return res.status(500).json({
            success: false,
            message: "error fetching media"
        });
        
    }

}





module.exports = {uploadmedia,getallmedia,deleteMedia}