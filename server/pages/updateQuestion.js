let questions = require('../models/questions.js')
let tags = require('../models/tags.js')
let Account = require('../models/account');


async function update_question(req) {
    const questionId = req.body.id; // Unique identifier for the question
    const email = req.body.email;
    const tagNames = req.body.tags;
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
    // Find or create tags and get their IDs
    const tagDocs = await Promise.all(
        tagNames.map(async (name) => {
            let tag = await tags.findOne({ name });
            if (!tag) {
                tag = new tags({ name });
                await tag.save();
                await Account.updateOne({email: email}, { $push: { tags: tag._id } });
            }
            return tag._id;
        })
    );

    // Update the existing question
    const updatedQuestion = await questions.findOneAndUpdate(
        { _id: questionId }, // Find by question ID
        {
            title: req.body.title,
            summary: req.body.summary,
            text: req.body.text,
            tags: tagDocs, // Update tags
        },
        { new: true } // Return the updated document
    );

    if (!updatedQuestion) {
        throw new Error('Question not found'); // Handle the case where the question doesn't exist
    }

    return updatedQuestion;
}

exports.update_question = update_question;

