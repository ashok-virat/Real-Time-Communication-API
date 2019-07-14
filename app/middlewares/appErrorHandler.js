const response=require('./../libs/responseLib')


let errorHandler=(err,req,res,next)=>{
    console.log('application error handler is called')
    console.log(err)
    let apiresponse=response.generate(true,"some error occured at global level",404,null)
    res.send(apiresponse)
}


let notfoundHandler=(req,res,next)=>{
    console.log('Global not found handler called')
    let apiresponse=response.generate(true,'Route not fount in your application',404,null)
    res.status(404).send('Route not found in the application')
}


module.exports={
    globalErrorHandler:errorHandler,
    globalNotFoundHandler:notfoundHandler
}