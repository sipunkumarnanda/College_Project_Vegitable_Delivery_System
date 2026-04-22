

import ImageKit from "imagekit";
import dotenv from "dotenv";
import mongoose from 'mongoose'

dotenv.config()


var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLICKEY,
    privateKey : process.env.IMAGEKIT_PRIVATEKEY,
    urlEndpoint : process.env.IMAGEKIT_ENDPOINT
});

function uploadFile(file){
    return new Promise((resolve, reject) => {
        imagekit.upload({
            file : file.buffer,
            // fileName : file.originalname,
            fileName : new mongoose.Types.ObjectId().toString(),
            folder : "cohort-audio"
        }, (error, result)=>{
            if(error){
                reject(error)
            }else{
                resolve(result)
            }
        })
    })
}

export default uploadFile