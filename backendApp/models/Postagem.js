const mongoose = require('mongoose');
const moment = require('moment');

const { Schema } = mongoose


const Postagem = new Schema ({

    titulo: {
        type: String,
        required: true
    },

    slug: {
        type: String,
        required: true
    },

    descricao: {
        type: String,
        required: true
    }, 

    conteudo: {
        type: String,
        required: true
    },

    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'categorias',
        required: true
    }, 
    
    data: {
        type: Date,
        default: Date.now(),
        get: function(value) {
            return moment(value).format('DD/MM/YYYY'); // formatando a data como dia/mês/ano
        }
    }
})

mongoose.model('postagens', Postagem)


module.exports = Postagem