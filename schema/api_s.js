const mongoose = require('mongoose')

const apiSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: String,
    description: String,
    // langauge: String,
    code: String,
    language: {type: String},
    date: {type:Date, default:Date.now},
    question_id: String

})


module.exports = mongoose.model( 'apis', apiSchema )