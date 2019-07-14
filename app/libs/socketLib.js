

const socketio=require('socket.io');
const mongoose=require('mongoose');
const shortid=require('shortid');
const logger=require('./../libs/loggerLib');
const events=require('events');
const chatpath=require('./../models/chatSchema')
const eventEmitter=new events.EventEmitter();

const tokenLib=require('./../libs/tokenLib');
const check=require('./../libs/checkLib');
const response=require('./../libs/responseLib');

const chatModel=mongoose.model('chatschema')
const redixLib=require('./../libs/redisLib')


let setServer=(server)=>{
   
    let io=socketio.listen(server);
    let myio=io.of('');

    myio.on('connection',(socket)=>{
        console.log('on connection--emitting verify user');

        socket.emit('verifyUser','');
        //coder to verify the user and make him online


        socket.on('set-user',(authToken)=>{
            console.log('set-user called');
            tokenLib.verifyClaimWithoutSecret(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth-error',{status:500,error:'please provide correct authToken'})
                }
                else {
                    console.log('user is verified..setting details');
                    let currentUser=user.data;

                    socket.userId=currentUser.userId;
                         
                    let fullName=`${currentUser.firstName} ${currentUser.lastName}`;

                    let key=currentUser.userId;
                     let value=fullName;
                    console.log(key)
                    console.log(value)
                     let setUserOnline=redixLib.setNewOnlineUserInHash('onlineUsers',key,value,(err,result)=>{
                         if(err){
                             console.log(err)
                         }
                         
                         else {
                             redixLib.getAllUsersInHash('onlineUsers',(err,result)=>{
                                 if(err){
                                     console.log(err)
                                 }
                                 else {
                                     console.log(`${fullName} is online`)

                                     socket.room='edChat';
                                     socket.join(socket.room)
                                     socket.to(socket.room).broadcast.emit('online-user-list',result)
                                 }
                             })
                         }
                     })
  
                      
                    
                }
            })
        })
        socket.on('disconnect',()=>{

            redixLib.deleteUserFromHash('onlineUsers',socket.userId);
            redixLib.getAllUsersInHash('onlineUsers',(err,result)=>{
                if(err){
                    console.log(err)
                }
                else {
                    socket.leave(socket.room)
                    socket.to(socket.room).broadcast.emit('online-user-list',result)
                }
            })
            console.log('user is disconnect');
            console.log(socket.userId)
             
                
           })

           eventEmitter.on('save-chat',(data)=>{
             console.log(data)
           let newChat=new chatModel({
               chatId:data.chatId,
               senderName:data.senderName,
               senderId:data.senderId,
               receiverName:data.receiverName,
               receiverId:data.receiverId,
               message:data.message,
               chatRoom:data.chatRoom || '',
               createdOn:data.createdOn,
               seen:data.seen
              
           })
           console.log(newChat)

           newChat.save((err,result)=>{
               if(err){
                   console.log('error occured'+err)
               }
               else if(result==undefined || result==null || result==''){
                   console.log('chat is not saved')
               }
               else {
                   console.log('chat is saved')
                   console.log(data)
               }
           })

           })
           socket.on('chat-msg',(data)=>{
               console.log('socket chat-msg called');
               console.log(data);
                
               data['chatId']=shortid.generate();
               console.log(data)
     
              eventEmitter.emit('save-chat',data)
               
               myio.emit(data.receiverId,data)
           })

           socket.on('typing',(data)=>{
               socket.to(socket.room).broadcast.emit('typing',data)
           })
        })
      

    
}

module.exports={
    setServer:setServer
}