let questions = require('../models/questions.js')
let tags = require('../models/tags.js')
let answer = require('../models/answers.js')

function get_question_answer(id){
    const data = questions.find({_id:id})
        .populate({
            path: 'answers',
            populate: {
                path: 'comment',
            },
        })
        .populate('tags')
        .populate('comment')

    return data;
}

exports.get_question_answer = get_question_answer;