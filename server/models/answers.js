// Answer Document Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var answersSchema = new mongoose.Schema(
    {
        text: { type: String, required: true},
        ans_by: { type: String, default: "Anonymous"},
        ans_date_time: { type: Date, default: Date.now},
        comment: [{type: Schema.Types.ObjectId, ref: 'comments'}],
        vote: { type: Number, default: 0},
        email: { type: String, required: true }
    }
);

answersSchema.virtual("url").get(function () {
    return `posts/answer/${this._id}`;
})

const answers = mongoose.model("answers", answersSchema);

module.exports = answers;