const questions = require('../models/questions.js');
const answers = require('../models/answers.js');
const Account = require('../models/account');
const { ObjectId } = require('mongodb');

async function update_answer(req) {
  const updatedData = req.body.answers;
  const answerId = updatedData.id; // Unique identifier for the existing answer


  const existingAnswer = await answers.findOne({ _id: new ObjectId(answerId) });

  if (!existingAnswer) {
    throw new Error('Answer not found'); // If the answer doesn't exist, handle it
  }

  // Update the existing answer with the new data
  const updatedAnswer = await answers.findOneAndUpdate(
    { _id: new ObjectId(answerId) },
    {
      text: updatedData.text,
    },
    { new: true } // Return the updated document
  );

  return updatedAnswer; // Return the updated answer
}

exports.update_answer = update_answer;
