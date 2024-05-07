import React from 'react'
import axios from 'axios';
export default class askQuestion extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            titleError: false,
            textError: false,
            textError_hyperlink: false,
            tagsError1: false,
            tagsError2: false,
            tagsError3: false,
            summaryError: false,
        }
    }
    handleQuestionBtn = async (target) =>{
        const { MenuHandleClick, username, setLoginAlert, setCurrentPage, email, editData, setEditData } = this.props;
        const titleInput = document.getElementById('ask_question_input1').value.trim();
        const summaryInput = document.getElementById('ask_question_input2').value.trim();
        const textInput = document.getElementById('ask_question_input3').value.trim();
        const tagsInput = document.getElementById('ask_question_input4').value.trim();
        let valid_pose = 1;
        // Check if any of the inputs is empty
        if (!titleInput || titleInput.length > 50) {
            this.setState({ titleError: true });
            valid_pose = 0;
        } else {
            this.setState({ titleError: false });
        }

        if (!summaryInput) {
            this.setState({ summaryError: true });
            valid_pose = 0;
        } else {
            if (summaryInput.length > 140){
                this.setState({ summaryError: true });
                valid_pose = 0;
            }
            else{
                this.setState({ summaryError: false });
            }
        }

        if (!textInput) {
            this.setState({ textError: true });
            valid_pose = 0;
        } else {
            // check existed http links
            let match_texts = textInput.match(/\[(.*?)\]\((.*?)\)/g);
            let valid_input = true;
            // check link starts with https:// and http://
            if (match_texts != null){
                valid_input = match_texts.every(text => {
                    let linkIndex = text.indexOf('(');
                    let showText = text.indexOf('[');
                    let link = text.slice(linkIndex+1, -1)
                    text = text.slice(showText+1, linkIndex-1);

                    if ((link.startsWith('https://') || link.startsWith('http://')) && text.length !== 0){
                        return true
                    }
                    return false;
                })
            }
            // if input valid
            if (valid_input){
                this.setState({ textError: false });
                this.setState({ TextError_hyperlink: false });
            }
            // if hyperlink not match rule, show error message
            else{
                valid_pose = 0;
                this.setState({ textError_hyperlink: true });
            }
        }

        let tagList = tagsInput.toLowerCase().split(/\s+/);
        if (!tagsInput) {
            this.setState({ tagsError3: true });
            this.setState({ tagsError1: false });
            this.setState({ tagsError2: false });
            valid_pose = 0;
        } else {
            let invalid = 0;
            // check tag match the syntax rule
            if (tagList.length > 5) {
                this.setState({ tagsError1: true });
                this.setState({ tagsError2: false });
                this.setState({ tagsError3: false });
                invalid += 1;
                valid_pose = 0;
            }
            if (tagList.some(tag => tag.length > 20)){
                this.setState({ tagsError1: false });
                this.setState({ tagsError2: true });
                this.setState({ tagsError3: false });
                valid_pose = 0;
                invalid += 1;
            }
            if (invalid === 0){ 
                this.setState({ tagsError1: false });
                this.setState({ tagsError2: false });
                this.setState({ tagsError3: false });

            }
        }
        // pose questions
        if (titleInput && textInput && tagsInput && summaryInput && valid_pose !== 0) { 
            // Create question object
            const question = {
              id : editData ? editData._id : null,
              title: titleInput,
              summary: summaryInput,
              text: textInput,
              tags: tagList,
              answers: [],
              asked_By: username,
              ask_date_time: new Date(),
              email: email,
              views: 0,
              votes: 0
            };

            try{
                if (target === 'pose'){
                    const response = await axios.post('http://localhost:8000/AskQuestionPage', question, { withCredentials: true});
                    if (response.data === 'Low Reputation'){
                        alert("You need at least 50 reputation to create new tags")
                    }
                    else{
                        MenuHandleClick("QuestionsBtn");
                    }
                    setEditData("")

                }
                else if (target === 'update'){
                    const response = await axios.post('http://localhost:8000/updateQuestion', question, { withCredentials: true});
                    if (response.data === 'Low Reputation'){
                        alert("You need at least 50 reputation to create new tags")
                    }
                    setEditData("")
                    setCurrentPage('userProfilePage')
                }
            }catch (error) {
                console.error("Error posting question:", error);
                setLoginAlert('1')
                setCurrentPage('homePage')
            }
        }
    }
    
    handleDeleteQuestion = async (questionId) => {
        const { setCurrentPage, setEditData, setLoginAlert} = this.props
        try {
            await axios.delete(`http://localhost:8000/questions/${questionId}`, { withCredentials: true });
            setCurrentPage('userProfilePage');
            setEditData('');
        } catch (err) {
            setLoginAlert('1')
            setCurrentPage('homePage')
            console.error('Failed to delete question:', err);
        }

    }

    render(){
        const { editData} = this.props;
        return(
            <div id='frame'>
                <div id="ask_question_frame" className="ask_question_frame">
                    <TitleInput titleError={this.state.titleError} editData={editData}/>
                    <SummaryInput summaryError={this.state.summaryError} editData={editData}/>
                    <TextInput textError={this.state.textError} textError_hyperlink={this.state.textError_hyperlink} editData={editData}/>
                    <TagsInput tagsError1={this.state.tagsError1} tagsError2={this.state.tagsError2} tagsError3={this.state.tagsError3} editData={editData}/>
                    {editData 
                        ?
                        <div style={{marginTop: "10px"}}>
                            <button type="button" id="post_question_button" style={{marginLeft: '20%'}} onClick={() => this.handleQuestionBtn('update')}>Update Question</button>
                            <button type="button" id="post_question_button" style={{marginLeft: '20%'}} onClick={() => this.handleDeleteQuestion(editData._id)}>Delete Question</button>
                        </div>
                        :<button type="button" id="post_question_button" style={{marginLeft: '20%'}} onClick={() => this.handleQuestionBtn('pose')}>Post Question</button>


                    }
                    <p style={{display: 'inline-block', marginLeft: '20%', color: 'crimson'}}>*indicates mandatory fileds</p>
                </div>
            </div>
        )
    }
}
function TitleInput(props){
    const { titleError, editData } = props;
    return(
        <>
            <h2 style={{paddingLeft: '20%'}}>Question Title*</h2>
            <p style={{fontStyle: 'italic', paddingLeft: '20%', marginLeft: '15px'}}>Limit title to 50 characters or less</p>
            <input className="ask_question_input" id="ask_question_input1" defaultValue={editData?editData.title:""}required/>
            <span className="error" id="titleError" 
            style={{display: titleError? 'block' : 'none'}}>
                Title must not exceed 50 characters and cannot be empty
            </span>
        </>
    )
}
function SummaryInput(props){
    const { summaryError, editData } = props;
    return(
        <>
            <h2 style={{paddingLeft: '20%'}}>Question Summary*</h2>
            <textarea className="ask_question_input" id="ask_question_input2" defaultValue={editData ? editData.summary : ""}required/>
            <span className="error" id="summaryError" 
            style={{display: summaryError? 'block' : 'none'}}>
                Summary cannot be empty and max is 140 words
            </span>
        </>
    )
}
function TextInput(props){
    const { textError, textError_hyperlink, editData } = props;

    return(
        <>
            <h2 style={{paddingLeft: '20%'}}>Question Text*</h2>
            <p style={{fontStyle: 'italic', paddingLeft: '20%', marginLeft: '15px'}}>Add details</p>
            <textarea className="ask_question_input" id="ask_question_input3" defaultValue={editData ? editData.text : ""}required></textarea>
            <span className="error" id="textError" 
            style={{display: textError? 'block': 'none'}}>
                Question text cannot be empty
            </span>
            <span className="error" id="textError_hyperlink" 
            style={{display: textError_hyperlink? 'block': 'none'}}>
                [] can't be empty and hyperlink () must start with https:// or http://
            </span>
        </>
    )
}
function TagsInput(props){
    const { tagsError1, tagsError2, tagsError3, editData } = props
    let tags = "";
    if (editData){
        tags = editData.tags.map(obj => obj.name).join(' ')
    }
    return(
        <>
            <h2 style={{paddingLeft: '20%', marginBottom: '5px'}}>Tags*</h2>
            <p style={{fontStyle: 'italic', paddingLeft: '20%', marginLeft: '15px', marginTop: '0px'}}>Add keywords separated by whitespace</p>
            <input className="ask_question_input" id="ask_question_input4" defaultValue={tags} required/>
            <span className="error" id="tagsErro1" 
            style={{display: tagsError1? 'block': 'none'}}>
                Enter up and to 5 tags separated by whitespace
             </span>
             <span className="error" id="tagsError2" 
            style={{display: tagsError2? 'block': 'none'}}>
                Each tag length should be less than 20 words
             </span>
             <span className="error" id="tagsErro3" 
            style={{display: tagsError3? 'block': 'none'}}>
                Tags can't be empty
             </span>
        </>
    )
}

