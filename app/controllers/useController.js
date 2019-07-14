const mongoose=require('mongoose')
const shortid=require('shortid')
const time=require('./../libs/timeLib')
const response=require('./../libs/responseLib')
const logger=require('./../libs/loggerLib')
const check=require('./../libs/checkLib')
const userblog=require('./../models/user')
const Promise=require('promise')
const validateInput=require('./../libs/paramsValidation')
const passwordLib=require('./../libs/generatepasswordLib')
const token=require('./../libs/tokenLib')
const Authblog=require('./../models/Auth')
const chatpath=require('./../models/chatSchema')
/* Models*/

const UserModel=mongoose.model('User')
const AuthModel=mongoose.model('Auth')
const chatModel=mongoose.model('chatschema')
// start user signup function


let viewall=(req,res)=>{
    UserModel.find()
    .lean()
    .select('-_id')
    .exec((err,result)=>{
        if(err){
            logger.captureError(err.message,'usercontroller:viewall()',8)
            let apiResponse=response.generate(true,'Failed to find user',500,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)) {
            let apiResponse=response.generate(true,'Failed to find user',500,null)
            res.send(apiResponse)
        }
        else {
            let apiResponse=response.generate(false,'users are found',200,result)
            res.send(apiResponse)
        }
    })
}


let viewbyuserId=(req,res)=>{
    UserModel.findOne({'userId':req.params.userId},(err,result)=>{
        if(err){
            let apiResponse=response.generate(true,'Failed To Find Single User',400,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            let apiResponse=response.generate(true,'Failed To Find Single User',403,null)
            res.send(apiResponse)
        }
        else {
            let apiResponse=response.generate(false,'user Is Found',200,result)
            res.send(apiResponse)
        }
    })
} 


let deleteUser=(req,res)=>{
    UserModel.deleteOne({'userId':req.params.userId},(err,result)=>{
        if(err){
            let apiResponse=response.generate(true,'Failed To Delete User',400,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            let apiResponse=response.generate(true,'Failed To delete Single User',403,null)
            res.send(apiResponse)
        }
        else {
            let apiResponse=response.generate(false,'user Is Deleted Successfully',200,result)
            res.send(apiResponse)
        }
    })
}

let updateUser=(req,res)=>{
    let options=req.body;
    UserModel.update({'userId':req.params.userId},options,{multi:true},(err,result)=>{
        if(err){
            let apiResponse=response.generate(true,'Failed To update the User',400,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            let apiResponse=response.generate(true,'Failed To update the User',403,null)
            res.send(apiResponse)
        }
        else {
            let apiResponse=response.generate(false,'user Is updated Successfully',200,result)
            res.send(apiResponse)
        }
    })
}


let logouttheuser=(req,res)=>{
    AuthModel.remove({'userId':req.params.userId},(err,result)=>{
        if(err){
            let apiResponse=response.generate(true,'Failed To logout',400,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            let apiResponse=response.generate(true,'Failed To logout',403,null)
            res.send(apiResponse)
        }
        else {
            let apiResponse=response.generate(false,'logout Successfully',200,result)
            res.send(apiResponse)
        }
    })
}


let signUpFunction=(req,res)=>{


//Starat validation of user Input

      let validateUserInput=()=>{
       return new Promise((resolve,reject)=>{
           if(req.body.email){
                 if(!validateInput.Email(req.body.email)){
                     let apiResponse=response.generate(true,'Email Does not meet the requirement',400,null)
                     reject(apiResponse)
                 }
                 else if(check.isEmpty(req.body.password)){
                     let apiResponse=response.generate(true,'"password" parameter is missing',400,null)
                     reject(apiResponse)
                 }
                 else {
                      resolve(req)
                 }
           }
           else {
               logger.captureError('Field Missing During User','user Controller: createUser()',5)
               let apiResponse=response.generate(true,"One or More Paramete(s) is Missing")
               reject(apiResponse)
           }
       })
                                }

//End validation of user Input

//Start CreateUser

         let createUser=()=>{
             return new Promise((resolve,reject)=>{
                 UserModel.findOne({email:req.body.email})
                 .exec((err,retrievedUserSetails)=>{
                     if(err){
                         logger.captureError(err.message,'userController: createUser()',10)
                         let apiResponse=response.generate(true,'Failed To Create User',400,null)
                         reject(apiResponse)
                     }
                      else if(check.isEmpty(retrievedUserSetails)){
                        
                         let newUser=new UserModel({
                             userId:shortid.generate(),
                             firstName:req.body.firstName,
                             lastName:req.body.lastName || '',
                             email:req.body.email.toLowerCase(),
                             mobileNumber:req.body.mobileNumber,
                             password:passwordLib.hashpassword(req.body.password),
                             createdOn:time.now()
                         })
                         newUser.save((err,newUser)=>{
                             if(err){
                                 console.log(err)
                                 logger.captureError(err.message,'userController: createUser()',8);
                                 let apiResponse=response.generate(true,'Failed to create user',400,null)
                                 reject(apiResponse)
                             }
                             else {
                                 let newUserObj=newUser.toObject();
                                 console.log(newUserObj)
                                 resolve(newUserObj)
                             }
                         })
                     }
                     else {
                         logger.captureError('user Cannot Be Created.User Already Present','userController:createUser()',7)
                         let apiResponse=response.generate(true,'User Already Present',403,null)
                         reject(apiResponse)
                     }
                 })
             })
         }
   //end create user

    validateUserInput(req,res)
   .then(createUser)
   .then((resolve)=>{
       delete resolve.password;
       let apiResponse=response.generate(false,'User Created',200,resolve)
       res.send(apiResponse)
   })
   .catch((err)=>{
       console.log(err)
       res.send(err)
   })


}// end user signup function

//start user login function

let loginFunction=(req,res)=>{

    let finduser=()=>{
        return new Promise((resolve,reject)=>{
            if(req.body.email){
                console.log('req body email is there');
                UserModel.findOne({email:req.body.email},(err,userDetails)=>{
                    if(err){
                        logger.captureError('Failed To Retrive User Data','userController:finduser()',7)
                        let apiResponse=response.generate(true,'Failed TO Find User Data',400,null)
                        reject(apiResponse)
                    }
                    else if(check.isEmpty(userDetails)){
                        logger.captureError('No User Found','userController:finduser()',6)
                        let apiResponse=response.generate(true,'No User Found',404,null)
                        reject(apiResponse)
                    }
                    else {
                        logger.captureInfo('user Found','usercontroller:finduser()',10)
                        resolve(userDetails)
                    }
                })
                
            }
            else {
                let apiResponse=response.generate(true,"email parameter is missing",400,null)
                reject(apiResponse)
            }
        })
    }


    let validatePassword=(retrievedUserSetails)=>{
        return new Promise((resolve,reject)=>{
                  passwordLib.comparepassword(req.body.password,retrievedUserSetails.password,(err,isMatch)=>{
                      if(err){
                          logger.captureError(err.message,'userController:validatePassword()',10)
                          let apiResponse=response.generate(true,'Login Failed',500,null)
                          reject(apiResponse)
                      }
                      else if(isMatch){
                          let retrievedUserSetailsObj=retrievedUserSetails.toObject();
                          delete retrievedUserSetailsObj.password;
                          delete retrievedUserSetailsObj._id;
                          delete retrievedUserSetailsObj.__v;
                        resolve(retrievedUserSetailsObj)
                      }
                      else {
                          logger.captureError('Login Failed Due To Invalid Password',"userController:validatePassword()",7)
                          let apiResponse=response.generate(true,'Log In Failed.Wrong Password',400,null)
                          reject(apiResponse)
                      }
                  })
        })
    }

    let generatetoken=(userDetails)=>{
        console.log('generate token')
        return new Promise((resolve,reject)=>{
            token.generateToken(userDetails,(err,tokenDetails)=>{
              if(err){
                  logger.captureError(err.message,'usercontroller:genertaetoken()',5)
                  let apiResponse=response.generate(true,'Failed To Generate Token',404,null)
                  reject(apiResponse)
              }
              else {
                  console.log(tokenDetails)
                  tokenDetails.userId=userDetails.userId;
                  tokenDetails.userDetails=userDetails;
                  resolve(tokenDetails)
              }
            })
        })

    }
    let saveToken=(tokenDetails)=>{
        return new Promise((resolve,reject)=>{
            AuthModel.findOne({userId:tokenDetails.userId},(err,retrievedUserSetails)=>{
                if(err){
                    logger.captureError(err.message,'userController:saveToken',10)
                    let apiResponse=response.generate(true,'Failed to Generate Token',500,null)
                    reject(apiResponse)
                }
                else if(check.isEmpty(retrievedUserSetails)) {
                    let newAuthToken=new AuthModel({
                        userId:tokenDetails.userId,
                        authToken:tokenDetails.token,
                        tokenSecret:tokenDetails.tokenSecret,
                        tokenGenerationTime:time.now()
                    })
                    newAuthToken.save((err,newTokenDetails)=>{
                        if(err){
                            logger.captureError(err.message,'userController:saveToken()',10)
                            let apiResponse=response.generate(true,'Failed To Generate Token',500,null)
                            reject(apiResponse)
                        }
                        else{
                            let responseBody={
                                authToken:newTokenDetails.authToken,
                                userDetails:tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }else {
                    retrievedUserSetails.authToken=tokenDetails.token;
                    retrievedUserSetails.tokenSecret=tokenDetails.tokenSecret;
                    retrievedUserSetails.tokenGenerationTime=time.now();
                    retrievedUserSetails.save((err,newTokenDetails)=>{
                             if(err){
                                 logger.captureError(err.message,'userController:saveToken()',10)
                                 let apiResponse=response.generate(true,'Failed To Generate Token',500,null)
                                 reject(apiResponse)
                             }
                             else {
                                   let responseBody={
                                    authToken:newTokenDetails.authToken,
                                    userDetails:tokenDetails.userDetails
                                   }
                                   resolve(responseBody)
                             }
                    })
                    
                }
            })
        })
    
    }

     finduser(req,res)
    .then(validatePassword)
    .then(generatetoken)
    .then(saveToken)
    .then((resolve)=>{
        let apiResponse=response.generate(false,'Login Successfully',200,resolve)
        res.send(apiResponse)
    })
    .catch((err)=>{
        console.log(err)
        res.send(err)
    })
}//end user login function

//start logout function

let logout=(req,res)=>{


}//end logout function

let Allchats=(req,res)=>{
    chatModel.find({'senderId':req.params.senderId},(err,result)=>{
        if(err){
            logger.captureError(err.message,'usercontroller:getchat()',8)
            let apiResponse=response.generate(true,'Failed To Get Chat',404,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            let apiResponse=response.generate(true,'Failed To Get chat',400,null)
            res.send(apiResponse)
        }
        else{
            let apiResponse=response.generate(false,'All chats are listed',200,result)
            res.send(apiResponse)
        }
    })


}

let Mychats=(req,res)=>{
    chatModel.find({'receiverId':req.params.receiverId},(err,result)=>{
        if(err){
            logger.captureError(err.message,'usercontroller:Mychat()',8)
            let apiResponse=response.generate(true,'Failed To Get Chat',404,null)
            res.send(apiResponse)
        }
        else if(check.isEmpty(result)){
            let apiResponse=response.generate(true,'Failed To Get chat',400,null)
            res.send(apiResponse)
        }
        else{
            let apiResponse=response.generate(false,'All chats are listed',200,result)
            res.send(apiResponse)
        }
    })


}

module.exports={
    signUpFunction:signUpFunction,
    loginFunction:loginFunction,
    logout:logout,
    viewall:viewall,
    viewbyuserId:viewbyuserId,
    deleteUser:deleteUser,
    updateUser:updateUser,
    logout:logouttheuser,
    Allchats:Allchats,
    Mychats:Mychats
}