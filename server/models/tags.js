var mongoose = require('mongoose');

var tagsSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: [{ type: String, required: true }]
    }
);

tagsSchema.virtual("url").get(function () {
    return `posts/tag/${this._id}`;
})

const tags = mongoose.model("tags", tagsSchema);

module.exports = tags;