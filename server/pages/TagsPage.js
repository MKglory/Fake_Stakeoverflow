const questions = require('../models/questions'); // Assuming you have a Mongoose model named 'Question' for questions
const tags = require('../models/tags'); // Assuming you have a Mongoose model named 'Tag' for tags

exports.get_tags = async function get_tags() {
    
    try {
        // Fetch questions and populate their 'tags' field
        const q = await questions.find();
        // Fetch all tags
        const t = await tags.find();
        return {
            questions: q,
            tags: t
        };
    } catch (error) {
        // Handle any errors
        console.error('Error fetching data:', error);
        throw error; // Rethrow the error for handling at a higher level
    }
}
