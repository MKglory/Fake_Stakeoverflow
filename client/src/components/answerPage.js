import React from 'react'
import { useState } from 'react';
import axios from 'axios'
export default class AnswerPage extends React.Component{
    render(){
        const { data, changePage, ClickQuestionTitle, setLoginAlert, username, email, clickQuestionQid, fetchData, setReputation, reputation } = this.props;
        const question = data[0];
        // this the regular expression for extract hyperLink
        const reg = /\[(.*?)\]\((.*?)\)/g;
        function formatHyperlink(text){
            text = text.replace(reg, (match, t, url) => {
                if (match){
                    return `<a href=${url} target="_blank">${t}</a>`;
                } else {
                    // If no match is found, return the original text
                    return `text`;
                }
            });
            return text;
        };
        return(
            <div id='frame'>
                <SubHeader data={data} changePage={changePage} formatHyperlink={formatHyperlink} setLoginAlert={setLoginAlert} username={username} email={email}/>
                <SubHeader2 data={data} formatHyperlink={formatHyperlink} username={username} email={email} setReputation={setReputation} fetchData={fetchData} clickQuestionQid={clickQuestionQid}/>
                <Attributes tags={question.tags}/>
                <Comment object={question} username={username} email={email} target="q" target_id={clickQuestionQid} fetchData={fetchData} reputation={reputation} setReputation={setReputation}/>
                <Answers data={data} formatHyperlink={formatHyperlink} username={username} email={email} fetchData={fetchData} setReputation={setReputation} reputation={reputation}/>
                <PoseButton data={data} ClickQuestionTitle={ClickQuestionTitle} changePage={changePage} username={username}/>
            </div>
            
        )
    }
}

function SubHeader(props){
    const { data, changePage, formatHyperlink, setLoginAlert, username, email } = props;
    const question = data;
    const handle_AskQuestionClick = () =>{ 
        if (username === 'Guest'){
            changePage('login');
            setLoginAlert('1');
        }
        else{
            changePage('AskQuestionPage');
        }
    };

    return(
        <div id="question_page_subHeader" className="question_page_subHeader">
            <h3 style={{flex: 1}}>{question[0].answers.length} {question[0].answers.length === 1? 'answer': 'answers'}</h3>
            <h4 style={{flex: 5, fontWeight: 'bold'}}>
                <div dangerouslySetInnerHTML={{ __html: formatHyperlink(question[0].title)}} />
            </h4>
            {email
            ?<div style={{flex: 2}} id="askQuestion_div" className="askQuestion_div">
            <button id="ans_page_askQuestion" 
            className="askQuestion"
            onClick={handle_AskQuestionClick}>
                Ask Question
            </button>
            </div>
            :null
            }
        </div>
    ); 
}
function SubHeader2(props){
    const { data, formatHyperlink, username, email, setReputation, fetchData, clickQuestionQid } = props;
    const question = data;
    const handleVote = async (vote, id) =>{
        try{
            const target = 'q'
            const response = await axios.post('http://localhost:8000/answersQuestionVote', {target, id, vote, username, email}, { withCredentials: true});
            if (response.data.message === 'Already voted'){
                alert(response.data.message)
            }
            else if (response.data.message === 'low reputation'){
                alert("Thank you for you feedback, but you reputation should at least 50 in case to vote");
            }
            console.log('here')
            setReputation(response.data.reputation);
            await fetchData('answersPage')
        }
        catch (error){
            console.error("Error posting question:", error);
        }
    }
    const upvote = () =>{
        handleVote(1, clickQuestionQid)
    }
    const downvote = () =>{
        handleVote(-1, clickQuestionQid)
    }
    return(
        <div id="question_page_subHeader2" className="question_page_subHeader2">
            <div style={{flex: 2.5, width: '20%'}}>
                <h3>{question[0].views+1} {question[0].views+1 === 1? 'view': 'views'}</h3>
                <h3 style={{marginTop: "100px"}}>{question[0].votes} {question[0].views+1 === 1? 'vote': 'votes'}</h3>
            </div>
            <h3 style={{flex: 10}}>
                <div dangerouslySetInnerHTML={{ __html: formatHyperlink(question[0].text)}} />
            </h3>
            <div className='pose_time_answer_page'>
                {question[0].email !== email
                    ? <p className='name'>{question[0].asked_by}</p>
                    : <p className='name'>You</p>
                }
                <p style={{fontStyle: 'italic', color:'grey'}}>asked {formatQuestionMetadata(question[0].ask_date_time)}</p>
                <div>
                    <div>vote: {question[0].votes}</div>
                    {question[0].email !== email ?(
                        <>
                            <button onClick={upvote}>upvote</button>
                            <button onClick={downvote}>downvote</button>
                        </>
                    ) : null
                    }
                </div>
            </div>
        </div>  
    )
}
function Attributes(props){
    let tags = props.tags;
    return(
        tags.length !== 0
            ?<div style={{padding: "15px"}} className ='attributes'>
                <ul>
                    {(()=>{
                        let content = [];
                        for (const tag of tags){
                            content.push(<li key={tag._id}>{tag.name}</li>);
                        }
                        return content;
                    })()
                    }
                </ul>
            </div>
            : ""
        
    )
}
function Answers(props){
    const { data, formatHyperlink, username, email, fetchData, setReputation, reputation } = props;
    const [currentAnswersPage, setCurrentPage] = useState('0');
    const question = data[0];
    const getAnswerSortNewest = (question) => {
        return question.answers.sort((a1, a2) =>
        ((new Date (a2.ans_date_time)) - (new Date (a1.ans_date_time)))
        )
    }
    const sorted_answers = getAnswerSortNewest(question);
    const answersPerPage = 5
    const startIndex = currentAnswersPage * answersPerPage;
    const currentAnswers = sorted_answers.slice(startIndex, startIndex + answersPerPage)

    const handleNextPage = () => {
        const totalPages = Math.ceil(sorted_answers.length / answersPerPage);
        if (currentAnswersPage < totalPages - 1 ){
            setCurrentPage(currentAnswersPage + 1)
        }
    }
    const handlePrevPage = () => {
        if (currentAnswersPage > 0) {
            setCurrentPage(currentAnswersPage - 1)
        }
    }
    const handleVote = async (vote, id) =>{
        try{
            const target = 'a';
            const response = await axios.post('http://localhost:8000/answersQuestionVote', {target, id, vote, username, email}, { withCredentials: true});
            if (response.data.message === 'Already voted'){
                alert(response.data.message)
            }
            else if (response.data.message === 'low reputation'){
                alert("Thank you for you feedback, but you reputation should at least 50 in case to vote");

            }
            setReputation(response.data.reputation);
            await fetchData('answersPage')
        }
        catch (error){
            console.error("Error posting question:", error);
        }
    }
    const upvote = (id) =>{
        handleVote(1, id)
    }
    const downvote = (id) =>{
        handleVote(-1, id)
    }
    return (
        <>
            <h1 style={{paddingTop:'20px', paddingLeft:'10px', borderTop: '2px dotted black'}}>Answers:</h1>
            {currentAnswers.length !== 0 ? (
                currentAnswers.map((ans) => (
                    <>
                        <div id="answer_in_question_answer_page" className="answer_in_question_answer_page" key={ans._id}>
                            <div id="answer_page_text" className="answer_page_text">
                                <div dangerouslySetInnerHTML={{ __html: formatHyperlink(ans.text) }} />
                            </div>
                            <div id="answer_page_askBy">
                               {ans.email !== email 
                                    ? <p className="ansBy">{ans.ans_by}</p>
                                    : <p className="ansBy">You</p>
                               }
                                <p style={{ fontStyle: 'italic', color: 'grey' }}>answered {formatQuestionMetadata(ans.ans_date_time)}</p>
                                <div id='upDownVoteBtns'>
                                    <div>vote: {ans.vote}</div>
                                    {ans.email !== email ? (
                                        <>
                                            <button onClick={()=>upvote(ans._id)}>upvote</button><button onClick={()=>downvote(ans._id)}>downvote</button>
                                        </>
                                    ): null}
                                </div>
                            </div>

                        </div>


                        <div>
                            <Comment object={ans} username={username} email={email} target='a' target_id={ans._id} fetchData={fetchData} setReputation={setReputation} reputation={reputation}/>
                        </div>
                    </>
                ))
            ) : <h2 style=
            {{
                paddingLeft : '5%',
                paddingTop: '10px',
            }}>
                No Answers Found
            </h2>}
            <div id='questionListBtns'>
                {startIndex !== 0 ?<button className = "questionListBtn" onClick={handlePrevPage}>prev</button> : null}
                {startIndex < sorted_answers.length - 5 ?<button className = "questionListBtn" onClick={handleNextPage}>next</button> : null}
            </div>
        </>
    );
}
function Comment(props){
    const { object, username, email, target, target_id, fetchData, setReputation, reputation } = props;
    const [addComment, setAddComment] = useState('0')
    const [currentCommentPage, setCurrentCommentPage] = useState(0)
    const [commentError, setCommentError]= useState(0);
    const commentsPerPage = 3;
    const startIndex = currentCommentPage * commentsPerPage;
    const comments = object.comment;
    const sortedComments = comments.slice().reverse();
    const currentComments = sortedComments.slice(startIndex, startIndex + commentsPerPage);
    const handleAddComments = () =>{
        if (reputation < 50){
            setCommentError(2)
        }
        else{
            setAddComment('1')
        }
    }
    const handlePoseComment = async (comment) =>{
        const commentInput = document.getElementById('commentInput').value.trim();
        if(commentInput.length > 140){
            setCommentError(1);
        }
        else if(commentInput.length === 0){
            setAddComment('0');
        }
        else{
            try{
                await axios.post('http://localhost:8000/poseComment', {commentInput, username, email, target, target_id}, { withCredentials: true});
                setAddComment('0');
                // setValidReputation('0');
                setCommentError(0)
                await fetchData('answersPage');
            }catch (error) {
                console.error("Error posting question:", error);
            }
            setAddComment('0')
        }
    }
    const handlePrevPage = () =>{
        if (commentsPerPage > 0){
            setCurrentCommentPage(currentCommentPage - 1)
        }
    }
    const handleNextPage = () =>{
        const totalPage = Math.ceil(comments.length / commentsPerPage);
        if (currentCommentPage < totalPage - 1){
            setCurrentCommentPage(currentCommentPage + 1)
        }
    }
    const handleVote = async (vote, id) =>{
        try{
            const response = await axios.post('http://localhost:8000/commentsVote', {id, vote, username, email, target, target_id}, { withCredentials: true});
            if (response.data.message === 'Already voted'){
                alert(response.data.message)
            }
            setReputation(response.data.reputation);
            await fetchData('answersPage')
        }
        catch (error){
            console.error("Error posting question:", error);
        }
    }
    const upvote = (id) =>{
        handleVote(1, id)
    }
    return(
        <div id="CommentsDiv" style={{margin: '15px'}}>
            {comments.length !==0 ? <p>Comments:</p> : null}
            {currentComments.length !== 0 ? (
                currentComments.map((c, index) => (
                    <>
                        <div key={index} id="eachComment">
                            <div id="eachCommentText">{c.text}</div>
                            <div id="eachCommentAskBy">
                                <div id="commentPoseBy">
                                   {email !== c.email
                                    ?<p style={{display:'inline', color:"blue"}}>{c.ans_by}</p>
                                    :<p style={{display:'inline', color:"blue"}}>You</p>
                                   }
                                    <p style={{ fontStyle: 'italic', color: 'grey', display:'inline' }}> posed in {formatQuestionMetadata(c.ans_date_time)}</p>
                                </div>
                                <div id='upDownVoteBtns'>
                                    <div>vote: {c.vote}</div>
                                    {email !== c.email
                                        ?<button onClick={() => upvote(c._id)}>upvote</button>
                                        :null
                                    }

                                </div>
                            </div>
                        </div>
                    </>
                ))
                ) :
                null
            }
            <div id='commentNextPrevBtn'>
                {startIndex !== 0 ?<button className = "commentsListBtn" onClick={handlePrevPage}>prev</button> : null}
                {startIndex < comments.length - 3 ?<button className = "commentsListBtn" onClick={handleNextPage}>next</button> : null} 
            </div>

            {addComment === '0' ? 
                <>
                    <p style={{cursor:'pointer'}} id='addComment' onClick={handleAddComments}>Add a comment</p>
                    {commentError === 2 ?<div style={{color: 'red'}}>You should need at least 50 reputation to add comment</div> : null}
                </>
             :
                <div id='addCommentDiv'>
                    <p>Your comment:</p>
                    {commentError === 1 ?<div style={{color: 'red'}}>New comment should be less than 140 characters</div> : null}
                    <textarea type="text" id='commentInput'placeholder="Write your comment here..." />
                    <button onClick={handlePoseComment}>Pose comment</button>
                </div>
            }
        </div>
    )
}
function PoseButton(props){
    const { data, changePage, username } = props;
    return(
        <>
            {username === 'Guest'
                ?<button id={data._id} className="post_answer_button" onClick={()=>changePage('login')}>Log In</button>
                :<button id={data._id} className="post_answer_button" onClick={()=>changePage('PoseAnswerPage')}>Pose Answer</button>
            }
        </>
    )
}





// EXTRAL FUNCITON___________________________________

  // for time format
  function formatQuestionMetadata(postingDate) {
    const currentDate = new Date();
    postingDate = new Date(postingDate);
    const secondsInDay = 24 * 60 * 60;
    const secondsInHour = 60 * 60;
    
    const timeDifferenceInSeconds = (currentDate - postingDate) / 1000; // Convert milliseconds to seconds
    
    if (timeDifferenceInSeconds < 60) {
        return `${Math.floor(timeDifferenceInSeconds)} seconds ago`;
    } else if (timeDifferenceInSeconds < secondsInHour) {
        return `${Math.floor(timeDifferenceInSeconds / 60)} minutes ago`;
    } else if (timeDifferenceInSeconds < secondsInDay) {
        return `${Math.floor(timeDifferenceInSeconds / 3600)} hours ago`;
    } else if (currentDate.getFullYear() === postingDate.getFullYear()) { //in the same year
        return `${postingDate.toLocaleString('en-US', { month: 'short', day: 'numeric' })} at ${postingDate.toLocaleString('en-US', {hour12: false, hour: 'numeric', minute: '2-digit'})}`;
    } else {
        return `${postingDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${postingDate.toLocaleString('en-US', {hour12: false, hour: 'numeric', minute: '2-digit'})}`;
    }
  }
