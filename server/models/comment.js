var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    ans_by: { type: String, default: 'Anonymous'},
    email: { type: String, required: true },
    ans_date_time: { type: Date, default: Date.now},
    text: { type: String, required: true},
    vote: { type: Number, default: 0}
    // comments_vote: [{ type: Schema.Types.ObjectId, ref: "comments" }]
});

module.exports = mongoose.model('comments', commentSchema);
