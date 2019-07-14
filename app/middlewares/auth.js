const mongoose=require('mongoose');
const jwt=require('jsonwebtoken');
const Auth=mongoose.model('Auth');
const AuthPath=require('./../models/Auth');
const logger=require('./../libs/loggerLib');
const responseLib=require('./../libs/responseLib');
const token=require('./../libs/tokenLib');
const check=require('./../libs/checkLib');

let isAuthorized=(req,res,next)=>{
    if(req.params.authToken || req.query.authtoken || req.body.authToken || req.header('authToken')) {
        Auth.findOne({authToken:req.header('authToken') || req.params.authToken || req.query.authToken || req.body.authToken},(err,authDeatils)=>{
            if(err){
                logger.captureError(err.message,"AuthorizationMiddleware",10);
                let apiResponse=responseLib.generate(true,'Failed to authorizde',500,null);
                res.send(apiResponse)
            }
            else if(check.isEmpty(authDeatils)){
                
                 logger.captureError('No AuthorizationKey Is present','AuthorizationMiddleware',10)
                 let apiResponse=responseLib.generate(true,'Invalid or Expired AuthorizationKey',404,null)
                 res.send(apiResponse);
            }
            else {
                token.verifyClaim(authDeatils.authToken,authDeatils.tokenSecret,(err,decoded)=>{
                    if(err){
                        logger.captureError(err.message,"AithorizationMiddleWare",10)
                        let apiResponse=responseLib.generate(true,'Failed to Authorized',500,null)
                        res.send(apiResponse)
                    }
                    else {
                        req.user={userId:decoded.data.userId}
                        next()
                    }
                })
            }
            
        })
    }
    else {
        logger.captureError('AuthorizedToken Missing','AuyhorizationMiddleware',5)
        let apiResponse=responseLib.generate(true,'AuthorizationToken Is Missing In Request',400,null)
        res.send(apiResponse)
    }
}

module.exports={
    isAuthorized:isAuthorized
}