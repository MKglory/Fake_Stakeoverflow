var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    reputation: {type: Number, default: 50},
    questions: [{ type: Schema.Types.ObjectId, ref: "questions" }],
    answers: [{ type: Schema.Types.ObjectId, ref: "answers" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "tags" }],
    questions_vote: [{ type: Schema.Types.ObjectId, ref: "questions" }],
    answers_vote: [{ type: Schema.Types.ObjectId, ref: "answers" }],
    comment: [{type: Schema.Types.ObjectId, ref: 'comments'}],
    comments_vote: [{ type: Schema.Types.ObjectId, ref: "comments" }],
    register_date_time: { type: Date, default: Date.now},
    admin: {type: Number, default: 0}
});

module.exports = mongoose.model('Account', accountSchema);