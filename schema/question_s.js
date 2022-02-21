const mongoose = require('mongoose')

const questionSchema =mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {type: String, required: true},
    title: {type: String, required: true },
    language: {type: String, required: true},
    // match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])? /},
    description: {type: String, required: true},
    date: {type:Date, default:Date.now},
})

module.exports = mongoose.model('question', questionSchema)