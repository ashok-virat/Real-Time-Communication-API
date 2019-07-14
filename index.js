const express=require('express');
const app=express();
const path=require('path');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const fs=require('fs');
const http=require('http');
const appConfig=require('./config/appConfig');
const logger=require('./app/libs/loggerLib');
const routeLoggerMiddleWare=require('./app/middlewares/routeLogger');
const globalErrorMiddleWare=require('./app/middlewares/appErrorHandler');
const mongoose=require('mongoose');

const modelPath='./app/models';
const routePath='./app/routes';
const controllersPath='./app/controllers';
const libsPath='./app/libs';
const middlewaresPath='./app/middlewares';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(routeLoggerMiddleWare.logIp);
app.use(globalErrorMiddleWare.globalErrorHandler);
app.use(express.static(path.join(__dirname,'client')))

//Bootstrap models 

fs.readdirSync(modelPath).forEach((file)=>{
         if(file.indexOf('.js'))
         require(modelPath+"/"+file)
})
  

//Bootstrap routes  

fs.readdirSync(routePath).forEach((file)=>{
    if(file.indexOf('.js')){
        let route=require(routePath+'/'+file)
        route.setRouter(app)
    }
})

app.use(globalErrorMiddleWare.globalNotFoundHandler)




const server=http.createServer(app)
//start listening to http server
console.log(appConfig)
server.listen(appConfig.port)
server.on('error', onError)
server.on('listening', onListening)
//end server listening code

const socket=require('./app/libs/socketLib');
socket.setServer(server)

//error listener for http server 'error' event.
function onError(error){
    if(error.syscall !== 'listen')  {
        logger.captureError(error.code+'not equal Listen','serverOnErrorHandler',10)
        throw error;
    }
    switch(error.code) {
        case 'EACCES':
            logger.captureError(error.code+':elavated privilages required','serverOnErrorHandler',10)
            process.exit(1)
            break;
         case 'EADDRINUSE':
             logger.captureError(error.code,':port is already in use Ashok','serverOnErrorHandler',10)
             process.exit(1)
             break;
         default:
             logger.captureError(error.code+':some unknown error occured','serverOnErrorHandler',10)       
    }
}

//event listener for Http server 'listening' event;
    function onListening(){
        var addr=server.address()
        var bind=typeof addr === 'string'?'pipe'+addr:'port'+addr.port;
        ('Listening on'+bind)
        console.log(bind)
        logger.captureInfo('server listening on port'+addr.port,'serverListeningHandler',10)
    }
process.on('unhandledRejection',(reason,p)=>{
    console.log('unhandled Rejection at: Promise',p,'reason:',reason)
})

mongoose.connect(appConfig.db.uri, {useNewUrlParser: true});


mongoose.connection.on('error',function(err){
    console.log('database connection is error')
    console.log(err)
})

mongoose.connection.on('open',function(err){
   if(err){ 
       console.log('database error')
       console.log(err)
   } else {
       console.log('database connection is open success ')
   }
})