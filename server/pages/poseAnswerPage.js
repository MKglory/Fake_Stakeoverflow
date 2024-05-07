let questions = require('../models/questions.js')
let answers = require('../models/answers.js')
const Account = require('../models/account');
const {ObjectId} = require('mongodb');

async function pose_answer(req){
    const qid = req.body.qid;
    const ans = req.body.answers;
    const email = ans.email;

    const question = await questions.find({_id: new ObjectId(qid)})

    const Answer = new answers({
        text: ans.text,
        ans_by: ans.ans_by,
        ans_date_time: ans.ans_date_time,
        email: email
    });
    await Answer.save(); 
    const account = await Account.findOne({email: email});
    await Account.updateOne({email: email}, { $push: {answers: Answer._id}});
    await questions.updateOne({_id: new ObjectId(qid)}, { $push: { answers: Answer._id } });

}

exports.pose_answer = pose_answer;