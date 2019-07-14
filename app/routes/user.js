const express=require('express');
const appConfig=require('./../../config/appConfig')
const controller=require('./../../app/controllers/useController')
const Auth=require('./../middlewares/auth')


module.exports.setRouter=(app)=>{
    let baseUrl=`${appConfig.apiVersion}/users`;


    app.get(`${baseUrl}/view/all`,Auth.isAuthorized,controller.viewall)

    app.get(`${baseUrl}/view/:userId`,Auth.isAuthorized,controller.viewbyuserId)

    app.post(`${baseUrl}/delete/:userId`,Auth.isAuthorized,controller.deleteUser)

    app.post(`${baseUrl}/update/:userId`,Auth.isAuthorized,controller.updateUser)

    app.post(`${baseUrl}/logout/:userId`,Auth.isAuthorized,controller.logout)

    app.post(`${baseUrl}/signup`,Auth.isAuthorized,controller.signUpFunction)

    app.post(`${baseUrl}/login`,Auth.isAuthorized,controller.loginFunction)

    app.post(`${baseUrl}/logout`,controller.logout)

    app.get(`${baseUrl}/chat/all/:senderId`,Auth.isAuthorized,controller.Allchats)

    app.get(`${baseUrl}/chat/all/mychats/:receiverId`,Auth.isAuthorized,controller.Mychats)
}