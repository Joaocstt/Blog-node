// Carregando modulos

const express = require('express')    
const handlebars  = require('express-handlebars');
const bodyParser = require('body-parser')
const app =  express()
const mongoose = require('mongoose');
const session = require('express-session')
const flash = require('connect-flash')

const passport = require('passport')
require('./config/auth')(passport)


// Routes

const usuarios = require('./routes/usuarios')
const admin = require('./routes/admin');


// Exportando models

require("../backendApp/models/Postagem")
const Postagem = mongoose.model("postagens")

require("../backendApp/models/Categoria")
const Categoria = mongoose.model("categorias")


// Configurações 

app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))


app.use(passport.initialize())
app.use(passport.session())

app.use(flash())


app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    next()
})


// Body Parser

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Handlebars

app.engine('handlebars', handlebars.engine({ 
    defaultLayout: 'main', 
    runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true },
}))

app.set('view engine', 'handlebars');

// Moongose 

mongoose.connect('mongodb://127.0.0.1:27017/blogapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

    }).then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
    }).catch((err) => {
        console.log('Erro ao conectar com o banco de dados: ', err);
    });

// Rotas

app.get('/' , (req, res) => {
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens)   => {
        res.render('index' , {postagens: postagens})
    }).catch((err) => {
        req.flash('msg_erro' , 'Houve um erro interno')
        res.redirect('/404')
    })
})


app.get('/postagem/:slug' , (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem) {
            res.render('postagem/index', {postagem: postagem})
        }
        else {
            req.flash('error_msg' , 'Está postagem não foi encontada')
            res.redirect('/')
        }
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg' , 'Houve um erro interno')
        res.redirect('/')
    })
})


app.get('/categorias' , (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('categorias/index' , {categorias: categorias})
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg' , 'Houve um erro ao listar a categoria!')
        res.redirect('/')
    })
})



app.get('/categorias/:slug' , (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(Categoria) {
            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render('categorias/postagem', {postagens: postagens, categoria: categoria})
            }).catch((err) => {
                req.flash('error_msg' , 'Houve um erro ao listar os posts')
                res.redirect('/')
            })

        }
        else {
            req.flash('error_msg' , 'Categoria não encontrada!')
            res.redirect('/')
        }
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg' , 'Houve um erro interno ao carregar a página desta categoria')
        req.redirect('/')
    })
})


app.get('/404' , (req, res) => {
    res.send('Erro 404!')
})

app.use('/admin', admin) // Admin é um prefixo para acessar nossas rotas

app.use('/usuarios', usuarios )

// outros 

const PORT = 3000

app.listen(PORT, () => {
    console.log('Servidor rodando na porta' + PORT)
})