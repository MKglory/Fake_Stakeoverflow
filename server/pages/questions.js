let questions = require('../models/questions.js')

function get_questions(){
    return questions.find({} , "title text")
        .sort({askDate : 1})
}

exports.show_questions = async function(req){
    try{
        let questions = await get_questions().exec();
        let questions_list = questions.map((q) => {
            return (
                '<li>' + q.title + '</li>' + '<li>' + q.text + "</li>"
            );
        })
        let msg = "<html><body><h1>Questions</h1><ul>"
        for (let q of questions_list){
            msg += q;
        }
        msg += "</ul></body></html>"
        req.send(msg);
    }
    catch(err){
        console.log("Could not get questions " + err);
    }
}