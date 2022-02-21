const mongoose = require('mongoose')

const privateApiSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {type: String,  required: true},
    description: {type: String,  required: true},
    code: {type: String,  required: true},
    language: {type: String, required: true, unique: true},
    access: {type: String, default:"Private", required: true},
    date: {type:Date, default:Date.now},
    question_id: mongoose.Schema.Types.ObjectId

})

module.exports = mongoose.model( 'papis', privateApiSchema )