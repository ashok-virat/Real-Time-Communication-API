const socket=io('http://localhost:3000')

const authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IkVGT1FKc1pUaCIsImlhdCI6MTU2MjgzNTQzOTI4MSwiZXhwIjoxNTYyOTIxODM5LCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZENoYXQiLCJkYXRhIjp7InVzZXJJZCI6IlV6Y2RhaG5yUSIsImZpcnN0TmFtZSI6ImFrIiwibGFzdE5hbWUiOiJ2aXJhdCIsImVtYWlsIjoiYmVqb2toYW5AZ21haWwuY29tIiwibW9iaWxlTnVtYmVyIjo3NjU0NDIxLCJjcmVhdGVkT24iOiIyMDE5LTA3LTA1VDA2OjIyOjE5LjAwMFoifX0.6PjAbN4bU9eW8R_AR1WC8rfKqS9IVNXDlY_5dUXi26s"


const userId='UzcdahnrQ';

let chatMessage={
    createdOn:Date.now(),
    receiverId:'CNKR6gz-w',
    receiverName:'ak virat',
    senderId:userId,
    senderName:'Ashokkkkk viratuuut'
} 

let chatsocket=()=>{
    socket.on('verifyUser',(data)=>{
        console.log('socket trying to verify user');
        socket.emit("set-user",authToken);
    })
    socket.on(userId,(data)=>{
        console.log('you received a message from'+data.senderName)
        console.log(data.message)
     });
     
     socket.on('online-user-list',(data)=>{
        console.log('online user list updated.some user came online or went offline')
        console.log(data)
    })
      
     $("#send").on('click',()=>{
         let messageText=$('#messageTosSend').val();
         chatMessage.message=messageText;
         socket.emit('chat-msg',chatMessage)
     })
     $('#messageTosSend').on('keypress',()=>{
        socket.emit('typing','Virat')
    })
    socket.on('typing',(data)=>{
        console.log(data+' is typing')
    })
}

chatsocket();