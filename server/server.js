// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt'); // CommonJS style for Node.js
const MongoStore = require('connect-mongo');
const { ObjectId } = require('mongodb');
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so';

const port = 8000;
const app = express();

function dynamicCorsOrigin(origin, callback) {
    if (origin && /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true)
    } else {
        callback(new Error("Not allowed by CORS"))
    }
}
// app.use(cors())
app.use(cors({
    origin: dynamicCorsOrigin,
    credentials: true
}));
app.use(express.json()); // Add this line to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Add this line to parse URL-encoded bodies
// app.use(
//     session({
//         secret: 'jieming and kai',
//         resave: false,
//         saveUninitialized: false,
//         store: MongoStore.create({ mongoUrl: mongoDB }),
//         cookie: { sameSite: "strict", httpOnly: true, maxAge: 7200000}
//     })
// )
app.use(
    session({
        secret: "supersecret difficult to guess string",
        cookie: { httpOnly: true, maxAge: 7200000, sameSite: "strict" },
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: mongoDB }),
    })
);

// Listen for connnection
app.listen(port, () => {
    console.log(`Server in port ${port} is listening`);
})
let questionsPage = require('./pages/questionsPage');
let answerPage = require('./pages/answerPage');
let askQuestionPage = require('./pages/askQuestionPage');
let updateQuestion = require('./pages/updateQuestion.js');
let TagsPage = require('./pages/TagsPage');
let poseAnswerPage = require('./pages/poseAnswerPage');
let updateAnswer = require('./pages/updateAnswer');

const Account = require('./models/account');
const Answers = require('./models/answers');
const Comment = require('./models/comment');
const Questions = require('./models/questions.js');
const Tags = require('./models/tags.js');


// set up mongoose connnection
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(() => console.log("Error connecting to MongoDB"));
var db = mongoose.connection;
//bind error handler
db.on('error', console.error.bind(console, "MongoDB connection error:"))


// middleware
function anthentification(req, res, next) {
    if (req.session && req.session.user) {
        next();
    }
    else {
        res.status(401).json({ error: "Unauthorized: please login in first" })
    }
}

// Router:
app.get("/QuestionsPage", async function (req, res) {
    try {
        // Access the 'sort' parameter from the query string
        const sortValue = req.query.sort;
        let data = await questionsPage.get_questions(sortValue);
        // // sort data 
        if (sortValue === "Unanswered") {
            data = data.filter(questions => questions.answers.length === 0)
        }
        else if (sortValue === "Active") {
            data = data.sort((q1, q2) => {
                // get q1 newest answers
                const q1_recent_ans = q1.answers.length > 0 ? q1.answers.sort((a1, a2) => {
                    return ((new Date(a2.ans_date_time)) - (new Date(a1.ans_date_time)));
                })[0] : null;
                // Check if q2 has answers
                const q2_recent_ans = q2.answers.length > 0 ? q2.answers.sort((a1, a2) => {
                    return ((new Date(a2.ans_date_time)) - (new Date(a1.ans_date_time)));
                })[0] : null;
                // Check if both questions have answers
                if (q1_recent_ans && q2_recent_ans) {
                    return (new Date(q2_recent_ans.ans_date_time) - new Date(q1_recent_ans.ans_date_time));
                } else if (q1_recent_ans) {
                    // Only q1 has answers
                    return -1; // Move q1 before q2
                } else if (q2_recent_ans) {
                    // Only q2 has answers
                    return 1; // Move q2 before q1
                } else {
                    // Neither question has answers
                    return 0; // No change in order
                }
            })
        }
        res.send(data);
    } catch (error) {
        console.log("Load QuestionsPage failed")
        console.log(error)
    }
});

app.get("/AnswersPage", async function (req, res) {
    try {
        const id = req.query.questionId;
        let data = await answerPage.get_question_answer(id);
        res.send(data);
    } catch (error) {
        console.log("Load AnswerPage failed")
        console.log(error)
    }
});

app.get('/TagsPage', async function (req, res) {
    const data = await TagsPage.get_tags();
    res.send(data);
})

app.post("/IncrementViews", async function (req, res) {
    let { views, id } = req.body;
    views = views + 1;
    await db.collection('questions').updateOne(
        { _id: new ObjectId(id) },
        { $set: { views: views }, $currentDate: { 'lastModified': true } }
    )
    const a = await db.collection('questions').findOne({ _id: new ObjectId(id) });
    res.json({ views: views });
});

app.post("/AskQuestionPage", anthentification, async function (req, res) {
    try {
        let data = await askQuestionPage.ask_questions(req);
        // if (data === 'low reputation'){
        //     res.json({error: "low reputation"});
        // }
        res.send(data);
    } catch (error) {
        console.log("Ask QuestionsPage failed")
    }
});
app.post('/updateQuestion', async (req, res) => {
    try {
        let data = await updateQuestion.update_question(req);
        res.send(data);
    } catch (error) {
        console.log("Update QuestionsPage failed", error)
    }
})

app.post("/PoseAnswerPage", anthentification, async function (req, res) {
    try {
        await poseAnswerPage.pose_answer(req);
        res.send("Pose Successfully");
    } catch (error) {
        console.log("Pose Answer failed", error)
        res.send("Pose Failed");
    }
});
app.post("/updateAnswer", anthentification, async function (req, res) {
    try {
        await updateAnswer.update_answer(req);
        res.send("update Successfully");
    } catch (error) {
        console.log("update Answer failed", error)
        res.send("update Failed");
    }
});

app.post("/login", async function (req, res) {
    const { email, password } = req.body;
    const account = await Account.findOne({ email: email });
    console.log(account);
    const admin = account ? account.admin : 0;
    // console.log(req.session.user)
    try {
        // if account doesn't in database
        if (!account) {
            return res.status(200).json({ error: "Account with provided email does not exist" })
        }
        // if account find in database
        const passwordCorrect = await bcrypt.compare(password, account.passwordHash);
        // if account password incorrect
        if (!passwordCorrect) {
            return res.status(200).json({ error: "Invalid password" })
        }
        // if log in successfully, set user data in session
        // req.session.user = {id: account._id, email: account.email}
        req.session.user = { email: account.email, username: account.username, reputation: account.reputation };
        res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email, admin: admin })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post("/register", async function (req, res) {
    const { name, email, password } = req.body;
    try {
        const accountExists = await Account.findOne({ email: email });
        if (accountExists) {
            return res.status(409).json({ error: "Email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newAccount = new Account({
            username: name,
            email: email,
            passwordHash: passwordHash
        });
        await newAccount.save();

        //req.session.user = { id: newAccount._id, email: newAccount.email, name: newAccount.username };

        res.status(201).json({ message: "Account created successfully", userId: newAccount._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destroy error:", err); // Corrected variable
            return res.status(500).json({ error: "Could not log out" });
        }
        // Clear the session cookie to ensure full logout
        res.clearCookie('connect.sid'); // Corrected clearCookie syntax
        res.status(200).json({ message: "Successfully logged out" });
    });
});
app.post('/poseComment', anthentification, async (req, res) => {
    const { commentInput, username, email, target, target_id } = req.body;
    const comment = new Comment({
        ans_by: username,
        text: commentInput,
        email: email
    })
    comment.save();

    try {
        // save comment to associated accout
        await Account.updateOne({ email: email }, { $push: { comment: comment._id } });

        // save comment to associated questions / comment
        if (target === 'q') {
            await Questions.updateOne({ _id: target_id }, { $push: { comment: comment._id } })
        }
        else if (target === 'a') {
            await Answers.updateOne({ _id: target_id }, { $push: { comment: comment._id } })
        }
        const account = await Account.findOne({ email: email })
        res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Upload comment error' });
    }
});
app.post('/commentsVote', anthentification, async (req, res) => {
    const { id, vote, username, email, target, target_id } = req.body;

    try {
        // const account = await Account.findOneAndUpdate({email: email}, { $push: { comments_vote: id } });
        const account = await Account.findOne({ email: email });
        if (account.comments_vote.includes(id)) [
            res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email, message: "Already voted" })
        ]
        else {
            await Account.updateOne({ email: email }, { $push: { comments_vote: id } });
            await Comment.findOneAndUpdate(
                { _id: id }, // find this id comment
                { $inc: { vote: vote } }, // update vote
            )
            res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Vote comment error' });
    }
})

app.post('/answersQuestionVote', anthentification, async (req, res) => {
    const { target, id, vote, username, email } = req.body;
    try {
        // const account = await Account.findOneAndUpdate({email: email}, { $push: { comments_vote: id } });
        const account = await Account.findOne({ email: email });
        if (target === 'q' && account.questions_vote.includes(id)) [
            res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email, message: "Already voted" })
        ]
        else if (target === 'a' && account.answers_vote.includes(id)) {
            res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email, message: "Already voted" })
        }
        else {
            // check reputation
            if (account.reputation < 50) {
                res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email, message: "low reputation" })
            }
            else {
                var receiver_email = "";
                if (target === 'q') {
                    await Account.updateOne({ email: email }, { $push: { questions_vote: id } });
                    const q = await Questions.findOneAndUpdate(
                        { _id: id }, // find this id comment
                        { $inc: { votes: vote } }, // update vote
                    )
                    receiver_email = q.email;
                }
                else if (target === 'a') {
                    await Account.updateOne({ email: email }, { $push: { answers_vote: id } });
                    const answers = await Answers.findOneAndUpdate(
                        { _id: id }, // find this id comment
                        { $inc: { vote: vote } }, // update vote
                    )
                    receiver_email = answers.email;
                }
                //Update the poser account repuation 
                if (vote === 1) {
                    await Account.updateOne(
                        { email: receiver_email },
                        { $inc: { reputation: 5 } }
                    )
                }
                else if (vote === -1) {
                    await Account.updateOne(
                        { email: receiver_email },
                        { $inc: { reputation: -10 } }
                    )
                }
                res.status(200).json({ username: account.username, reputation: account.reputation, email: account.email })
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Vote comment error' });
    }

})

app.get('/check-session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({ isLoggedIn: true, user: req.session.user })
    }
    else {
        res.json({ isLoggedIn: false });
    }
})

app.get('/userProfilePage', anthentification, async (req, res) => {
    // email = req.params.email
    const email = req.query.email;
    try {
        const account = await Account.findOne({ email: email })
            .populate({
                path: 'questions',
                populate: {
                    path: 'tags'
                },
                options: { sort: { 'ask_date_time': -1 } }
            })
            .populate({
                path: 'answers',
                options: { sort: { 'ans_date_time': -1 } }
            })
            .populate('tags')
            .populate('register_date_time')
            .populate('reputation')
            .exec();

        if (!account) {
            return res.status(404).json({ error: "Account not found" });
        }
        const tagsInformation = await TagsPage.get_tags();

        res.json({
            register_date_time: account.register_date_time,
            reputation: account.reputation,
            questions: account.questions,
            answers: account.answers,
            tags: account.tags,
            email: email,
            tagsInformation: tagsInformation,
            admin: account.admin
        });

    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/admin', anthentification, async (req, res) => {
    try {
        const users = await Account.find()
            .populate({
                path: 'questions',
                populate: {
                    path: 'tags'
                },
                options: { sort: { 'ask_date_time': -1 } }
            })
            .populate({
                path: 'answers',
                options: { sort: { 'ans_date_time': -1 } }
            })
            .populate('tags');

        res.status(200).json({ users: users })
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ error: 'Admin fetch all account inf failed' });
    }
})
app.delete('/answers/:answerId', anthentification, async (req, res) => {
    const { answerId } = req.params;
    try {
        const answer = await Answers.findById(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }
        //console.log(answer)
        await Account.updateMany(
            {},
            {
                $pull: {
                    answers: answer._id,
                    comment: { $in: answer.comment },
                    answers_vote: answer._id,
                    comments_vote: { $in: answer.comment }
                }
            }
        );
        await Comment.deleteMany({ _id: { $in: answer.comment } });
        await Answers.findByIdAndDelete(answerId);

        res.json({ message: 'Answer and all related data have been deleted successfully' });
    } catch (error) {
        console.error('Failed to delete answer and related data:', error);
        res.status(500).json({ message: 'Error deleting answer and related data' });
    }
});
app.delete('/users/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const account = await Account.findById(userId);
        if (!account) {
            console.error("User not found")
            return res.status(404).json({ message: 'User not found' });
        }
        const questions = await Questions.find({ _id: { $in: account.questions } });
        for (let question of questions) {
            const answers = await Answers.find({ _id: { $in: question.answers } });
            // delete the answers references of this question
            await Account.updateMany(
                {},
                {
                    $pull: {
                        questions: question._id,
                        answers: { $in: question.answers },
                        comment: { $in: question.comment },
                        questions_vote: question._id,
                        answers_vote: { $in: question.answers },
                        comments_vote: { $in: question.comment }
                    }
                }
            );
            // delete the comment references of all answers of this question
            for (let answer of answers) {
                await Comment.deleteMany({ _id: { $in: answer.comment } });
            }
            // delete the comment references of this question
            await Comment.deleteMany({ _id: { $in: question.comment } });
            await Answers.deleteMany({ _id: { $in: question.answers } });
            await Tags.updateMany(
                {},
                {
                    $pull: {
                        email: account.email,
                    }
                }
            )
            await Questions.findByIdAndDelete(question._id);
        }
        // Delete documents where the 'email' array is empty
        await Tags.deleteMany({
            email: { $size: 0 } //check if 'email' array is empty
        });
        // delete all comment from this account
        await Questions.updateMany(
            {},
            {
                $pull: {
                    comment: { $in: account.comment },
                    answers: { $in: account.answers },
                }
            }
        );
        // delete all answer associated with this account
        await Answers.updateMany(
            {},
            {
                $pull: {
                    comment: { $in: account.comment },
                }
            }
        );
        // delete all comment adnd answer documents associated with this account
        await Comment.deleteMany({email: account.email});
        await Answers.deleteMany({email: account.email});
        // delete account
        await Account.findByIdAndDelete(userId);
        res.json({ message: `Account and all associated data have been deleted successfully` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.delete('/questions/:questionId', anthentification, async (req, res) => {
    const { questionId } = req.params;
    try {
        const question = await Questions.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        const answers = await Answers.find({ _id: { $in: question.answers } });

        await Account.updateMany(
            {},
            {
                $pull: {
                    questions: question._id,
                    answers: { $in: question.answers },
                    comment: { $in: question.comment },
                    questions_vote: question._id,
                    answers_vote: { $in: question.answers },
                    comments_vote: { $in: question.comment }
                }
            }
        );

        for (let answer of answers) {
            await Comment.deleteMany({ _id: { $in: answer.comment } });
        }
        await Comment.deleteMany({ _id: { $in: question.comment } });
        await Answers.deleteMany({ _id: { $in: question.answers } });

        await Questions.findByIdAndDelete(questionId);
        res.status(200).json({ message: 'Question and all related data have been deleted successfully.' });
    } catch (error) {
        console.error('Failed to delete question and related data:', error);
        res.status(500).json({ message: 'Error deleting question and related data' });
    }
});

app.delete('/tags/:tagId', anthentification, async (req, res) => {
    try {
        const tagId = req.params.tagId;
        const result = await deleteTagIfUnused(tagId);
        res.json(result);
    } catch (error) {
        console.error('Failed to delete tag:', error);
        res.status(500).send({ message: 'Error deleting tag' });
    }
});
app.post('/editTags', anthentification, async (req, res) => {
    try{
        const tagId = req.body.tagId;
        const tagText = req.body.tagText;
        let tag = await Tags.findOne({name: tagText});
        if (!tag){
            tag = await Tags.findOne({_id: new ObjectId(tagId)});
        }
        // check it was no been used by other user
        if (tag.email.length > 1){
            res.json({error: "This tag has been used by another user"});
        }
        else{
            await Tags.updateOne(
                {_id: new ObjectId(tagId)},
                {
                    $set: {name: tagText},
                }
            )
            console.log(tag)
            res.json('Update Succesfully');
        }
    } catch (error){
        console.error('Failed to edit tag:', error);
        res.status(500).send({ message: 'Error edit tag' });
    }
})
async function deleteTagIfUnused(tagId) {
    // const questionsUsingTag = await Questions.countDocuments({ tags: tagId });
    const tag = await Tags.findOne({ _id: tagId });
    if (tag.email.length > 1) {
        return { error: 'Tag already in use by another user.' };
    }
    await Account.updateMany(
        {},
        {
            $pull: {
                tags: tagId
            }
        }
    );
    await Questions.updateMany(
        {},
        {
            $pull: {
                tags: tagId
            }
        }
    );
    await Tags.findByIdAndDelete(tagId);
    return { message: 'Tag deleted sucessful.' };
}


// Listen for SIGINT event (Ctrl-C)
process.on('SIGINT', async function () {
    try {
        await db.close();
        console.log("Server close. Database instance disconnected");
        process.exit(0);
    } catch {
        console.log("Fail to close server");
        process.exit(1);
    }

});