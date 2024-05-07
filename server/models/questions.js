// Question Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var questionsSchema = new mongoose.Schema(
    {
        // qid: { type: String, ReadableStreamDefaultReader: "q1"},
        title: { type: String, required: true},
        text: { type: String, required: true},
        summary: { type: String, required: true },
        tags: [{ type: Schema.Types.ObjectId, ref: 'tags', required: true}],
        answers: [{ type: Schema.Types.ObjectId, ref: 'answers'}],
        asked_by: { type: String, default: "Anonymous"},
        ask_date_time: { type: Date, default: Date.now},
        comment: [{type: Schema.Types.ObjectId, ref: 'comments'}],
        email: { type: String, required: true },
        views: { type: Number, default: 0},
        votes: { type: Number, default: 0}
        
    }
);

questionsSchema.virtual("url").get(function () {
    return `posts/question/${this._id}`;
})

const questions = mongoose.model("questions", questionsSchema);

module.exports = questions;