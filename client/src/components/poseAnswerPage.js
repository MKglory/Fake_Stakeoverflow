import React, { createRef } from 'react'
import axios from 'axios';
export default class answerQuestion extends React.Component{
    constructor(props){
        super(props);
        this.answer_question_input1= createRef();
        this.answer_question_input2 = createRef();
        this.state = {
            usernameError: false,
            answerTextError: false,
            answerTextError_hyperlink: false
        }
        this.handleAnswerQuestionClick = () => handleAnswerQuestionClick(this);
    }
    handleDeleteAnswer = async (answerId) => {
        const { setCurrentPage, setEditData, setLoginAlert } = this.props;
        try {
            await axios.delete(`http://localhost:8000/answers/${answerId}`, { withCredentials: true });
            setCurrentPage('userProfilePage');
            setEditData('');
        } catch (err) {
            setLoginAlert('1');
            setCurrentPage('homePage');
            console.error('Failed to delete answer:', err);
        }
    }
    
    render(){
        const { answerTextError, answerTextError_hyperlink } = this.state;
        const { editData } = this.props
        const handleClickBtn = () =>{
            this.handleAnswerQuestionClick();
        }
        return(
          <div id='frame'>
            <div id="answer_question_frame" className="answer_question_frame">
{/* 
                    <h2 style={{paddingLeft: '20%'}}>Username*</h2>
                    <input className="answer_question_input" id="ask_question_input1" ref={this.answer_question_input1} required/>
                    <span className="error" id="usernameError" style={{display: 'none'}}>Username cannot be empty</span>
                    <span className="error" id='usernameError' style = {{display: usernameError? 'block': 'none' }}>
                        Username cannot be empty
                    </span> */}

                    <h2 style={{paddingLeft: '20%'}}>Answer Text*</h2>
                    <textarea className="answer_question_input" id="ask_question_input2" ref={this.answer_question_input2} defaultValue={editData ? editData.text : ""}required></textarea>
                    <span className="error" id="textError" style={{display: 'none'}}>Answer text cannot be empty</span>
                    <span className="error" id='answerTextError' style = {{display: answerTextError? 'block': 'none' }}>
                        Answer input can't be empty
                    </span>
                    <p className="error" id='answerTextError_hyperlink' style = {{display: answerTextError_hyperlink? 'block': 'none' }}>
                        [] can't be empty and hyperlink must start with "https://" or "http://"
                    </p>
                    {editData
                        ?
                        <div style = {{marginTop: '10px'}}>
                            <button type="button" id="answer_question_button" style={{marginLeft: '20%'}} onClick={() => handleClickBtn('update')}> Update Answer</button>
                            <button type="button" id="answer_question_button" style={{marginLeft: '20%'}} onClick={() => this.handleDeleteAnswer(editData._id)}> Delete Answer</button>
                        </div>
                        :<button type="button" id="answer_question_button" style={{marginLeft: '20%'}} onClick={() => handleClickBtn('pose')}> Post Answer</button>
                    }
                    <p style={{display: 'inline-block', marginLeft: '20%', color: 'crimson'}}>*indicates mandatory fileds</p>
                </div>
            </div>
        )
    }
}

async function handleAnswerQuestionClick(instance) {
    const { changePage, qid, setLoginAlert, setCurrentPage, username, email, editData, setEditData } = instance.props;
    // const username = instance.answer_question_input1.current.value.trim();// delete space
    
    const text = instance.answer_question_input2.current.value.trim();
    const errors = validateNewQuestion(username, text, instance);

    if (errors.length > 0) {
        // alert(errors.join("\n"));
        return;
    }
    const answers = {
        id: editData ? editData._id : null,
        text: text,
        ans_by: username,
        email: email,
        ans_date_time: new Date(),
    };

    try{
        if (editData){
            await axios.post('http://localhost:8000/updateAnswer', {qid, answers}, { withCredentials: true });
            changePage("userProfilePage");
            setEditData("")
        }
        else{
            await axios.post('http://localhost:8000/PoseAnswerPage', {qid, answers}, { withCredentials: true });
            changePage("AnswersPage");
            setEditData("")
        }

    }catch (error) {
        setLoginAlert('1');
        setCurrentPage('homePage')
        console.error("Error posting question:", error);
    }
}


function validateNewQuestion(askedBy, text, instance) {
    // const { usernameError, answerTextError, answerTextError_hyperlink } = instance.state;
    let errors = [];
    instance.setState({ answerTextError_hyperlink: false });
    if (askedBy.length === 0) {
        instance.setState({ usernameError: true });
        errors.push('Username cannot be empty');
    }
    else{
        instance.setState({ usernameError: false });
    }


    if (text.length === 0) {
        instance.setState({ answerTextError: true });
        errors.push('Answer text cannot be empty');
    }
    else{
        instance.setState({ answerTextError: false });
    }
    
    const potentialLinkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;  // [](https://)
    let malformedLinkFound = false;
    let result;

    while ((result = potentialLinkRegex.exec(text)) !== null) {
        const link = result[2];
        const text = result[1];
        console.log(result);

        if ((!link.startsWith('http://') && !link.startsWith('https://')) || text.length === 0) {
            instance.setState({ answerTextError_hyperlink: true });
            malformedLinkFound = true;
            break; 
        }
        else{
            instance.setState({ answerTextError_hyperlink: false });
        }

    }

    if (malformedLinkFound) {
        errors.push('Hyperlinks must begin with "http://" or "https://".');
    }

    return errors;
}
