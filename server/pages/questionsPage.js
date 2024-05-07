let questions = require('../models/questions.js')
let tags = require('../models/tags.js')
let answer = require('../models/answers.js')

function get_questions(){
    const data = questions.find({})
        .populate('tags')
        .populate('answers')
        .sort({ask_date_time : -1})

    return data;
}
exports.get_questions = get_questions;