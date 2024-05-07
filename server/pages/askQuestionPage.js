let questions = require('../models/questions.js')
let tags = require('../models/tags.js')
let Account = require('../models/account');


async function ask_questions(req){
    const tagNames = req.body.tags; //array of tags name
    const email = req.body.email;
    const account = await Account.findOne({email: email});
    const reputation = account.reputation;

    if (reputation < 50){
        for (let tagName of tagNames){
            const tag = await tags.findOne({name: tagName});
            console.log(tag);
            if (!tag){
                return "Low Reputation";
            }
        }
    }

    const tagDocs = await Promise.all(tagNames.map(async (name) => {
        let tag = await tags.findOne({ name: name });
        if (!tag) {
            tag = new tags({ 
                name: name,
                email: email
             });
            await tag.save();
            await Account.updateOne({email: email}, { $push: { tags: tag._id } });
        }
        else{
            await tags.updateOne(
                {_id: tag._id},
                {
                    $push: { email: email},
                }
            )
        }
        return tag._id;
    }));
    const Question = new questions({
        title: req.body.title,
        summary: req.body.summary,
        text: req.body.text,
        tags: tagDocs,
        email: req.body.email,
        answers: req.body.answers,
        asked_by: req.body.asked_By,
        ask_date_time: req.body.ask_date_time,
        views: req.body.views,
        votes: req.body.votes  
      });
      await Question.save()
      await Account.updateOne({email: email}, { $push: { questions: Question._id } });

      return "Post question successfully"; 
}

exports.ask_questions = ask_questions;
