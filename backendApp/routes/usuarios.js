const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')


router.get('/registro' , (req, res) => {
    res.render('usuarios/registro')
})


router.post('/registro' , (req, res) =>{
    let erros = [] 

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome === null) {
        erros.push({texto: 'Nome invalido'})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email === null) {
        erros.push({texto: 'Email invalido'})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha === null) {
        erros.push({texto: 'Senha invalido'})
    }

    if(req.body.senha.length < 4) {
        erros.push({texto: 'Senha muito curta'})
    }

    if(req.body.senha != req.body.senha2) {
        erros.push({texto: 'As senha são diferentes, tente novamente!'})
    }

    if(erros.length > 0) {
        res.render('usuarios/registro' , {erros: erros})
    } 

    else {
        Usuario.findOne({email: req.body.email}).then((usuario) =>{                 // O findOne faz uam busca e retorna se existe alguém com esse mesmo email
            if(usuario) {
                req.flash('error_msg' , 'Email já existe em nosso sistema!')
                res.redirect('/usuarios/registro')
            }
            else {

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash('error_msg', 'houve um erro durante o salvamento do usuário')
                            res.redirect('/')
                        }

                        novoUsuario.senha = hash

                        Usuario.create(novoUsuario).then(() => {
                            req.flash('success_msg' , 'Usuário cadastrado com sucesso!')
                            res.redirect('/')
                        }).catch((err) =>{
                            console.log(err.nome)
                            req.flash('error_msg' , 'Houve um erro ao criar o usuário')
                            req.redirect('/usuarios/registro')
                        })

                    })
                })


            }
        }).catch((err) => {
            console.log(err)
            req.flash('msg_error' , 'Houve um erro interno!')
            res.redirect('/')
        })
    }
})


router.get('/login' , (req, res) => {
    res.render('usuarios/login')
})



router.post('/login' , (req, res, next) => {
    passport.authenticate("local" , {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    }) (req, res, next)

})


router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            req.flash('error_msg', 'Houve um erro ao se desconectar')
            res.redirect('/')
        } else {
            req.flash('success_msg', 'Deslogado com sucesso!')
            res.redirect('/')
        }
    })
})

module.exports = router