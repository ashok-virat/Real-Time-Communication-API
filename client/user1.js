const socket=io('http://localhost:3000')

const authToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IkxWblJydWhfRSIsImlhdCI6MTU2MjgzNTU0Mjg3NSwiZXhwIjoxNTYyOTIxOTQyLCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJlZENoYXQiLCJkYXRhIjp7InVzZXJJZCI6IkNOS1I2Z3otdyIsImZpcnN0TmFtZSI6IkFzaG9ra2trayIsImxhc3ROYW1lIjoidmlyYXR1dXUiLCJlbWFpbCI6InBvZGFAZ21haWwuY29tIiwibW9iaWxlTnVtYmVyIjoxMjM0NDU2LCJjcmVhdGVkT24iOiIyMDE5LTA3LTA4VDA1OjQ0OjE1LjAwMFoifX0.rMr8OsnuUR_YIqcN_IUjLnq3jxWeD2jLh5RROZ9_MU8";


const userId="CNKR6gz-w";

let chatMessage={
    createdOn:Date.now(),
    receiverId:'UzcdahnrQ',
    receiverName:'Ashokkkkk viratuuu',
    senderId:userId,
    senderName:'ak virat'
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
        socket.emit('typing','Ashok')
    })
    socket.on('typing',(data)=>{
        console.log(data+' is typing')
    })
}

chatsocket();