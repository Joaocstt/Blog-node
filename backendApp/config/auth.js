const LocalStrategy = require('passport-local').Strategy

const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')

// Model de usuário

require('../models/Usuario')
const User = mongoose.model('usuarios')

module.exports = function(passport) {

    passport.use(new LocalStrategy({usernameField: 'email' , passwordField: 'senha' }, (email, senha, done) => {

        User.findOne({email: email}).then((usuario) => {
            if(!usuario) {
                return done(null, false, {message: 'Está conta não existe!'})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem) {
                    return done(null, usuario)
                }

                else {
                    return done(null, false, {message: 'Senha incorreta!'})
                }
            })

            
        })


    }))


    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
          const usuario = await User.findById(id)
          done(null, usuario)
        } catch (err) {
          done(err, null)
          console.log(err)
        }
    })
}
