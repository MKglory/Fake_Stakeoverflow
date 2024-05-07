import React from 'react'

// header
function SortButtons(props){
    const { ClickSortButton } = props;
    const handle_SortClick= (sortType) =>{
        ClickSortButton(sortType);
    }
    return(
        <div id="sort_bottons" className="sort_buttons">
            <button type="button" id="Newest_sort" onClick={()=>handle_SortClick('Newest')}>Newest</button>
            <button type="button" id="Active_sort" onClick={()=>handle_SortClick('Active')}>Active</button>
            <button type="button" id="Unanswered" onClick={()=>handle_SortClick('Unanswered')}>Unanswered</button>
        </div>
    )
}
function Header1(props){
    const { search,changePage, username, setLoginAlert, email } = props;
    const handle_AskQuestionClick = () =>{
        if (username === 'Guest'){
            changePage('login')
            setLoginAlert('1');
        }
        else{
            changePage('AskQuestionPage');
        }
    };
    return(
        <div id="sub_header" className="sub_header">
            <h3 id="sub_header_content">{search === ''? "All Questions" : "Search Results"}</h3>
            <div id="askQuestion_div" className="askQuestion_div">
                {
                email
                ?<button id="askQuestion" className="askQuestion" 
                onClick={handle_AskQuestionClick}>
                    Ask Question
                </button>
                : null
}
            </div>
        </div>
    )
}
function Header2(props){
    const { questions, ClickSortButton } = props;
    return(
        <div id="sub_header2" className="sub_header2">
            <p id="num_question_frame">{questions.length === 1? '1 questions': `${questions.length} questions`}</p>
            <SortButtons ClickSortButton={ClickSortButton}/>
        </div>
    )
}
function QuestionsPageHeader(props){
    const ClickSortButton = props.ClickSortButton;
    const { search, changePage, questions, username, setLoginAlert, email } = props;
    return(
    <>
        <Header1 search={search} changePage={changePage} username={username} setLoginAlert={setLoginAlert} email={email}/>
        <Header2 questions={questions} ClickSortButton={ClickSortButton}/>
    </>
    )
};


//questions Lists
function AnsView(props){
    const { q } = props;
    return(
        <div className='ans_view'>
            {/* <p>{q.ansIds.length === 1 ? '1 answer' : `${q.ansIds.length} answers`}</p> */}
            <p>{q.answers.length === 1 ? '1 answer' : `${q.answers.length} answers`}</p>
            <p>{q.views === 1 ? '1 view' : `${q.views} views`}</p>
            <p>{q.votes === 1 ? '1 vote' : `${q.votes} votes`}</p>
        </div>
    )
}
function Attributes(props){
    let tags = props.tags;
    return(
    <div className ='attributes'>
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
    )
}
function PoseQuestionTime(props){
    let { question } = props;
    return(
        <div className='pose_time'>
        <p className='name'>{question.asked_by} </p>
        <p style={{fontStyle: 'italic'}}>asked {formatQuestionMetadata(question.ask_date_time)}</p>
        </div>
    )
}
class QuestionList extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            currentQuestionsPage : 0
        }
        this.handleNextPage = this.handleNextPage.bind(this);
        this.handlePrevPage = this.handlePrevPage.bind(this);
    }
    handleNextPage = () => {
        const questionsPerPage = 5
        const totalPages = Math.ceil(this.props.questions.length / questionsPerPage);
        if (this.state.currentQuestionsPage < totalPages -1){
            this.setState( (prevState) => ({
                currentQuestionsPage: prevState.currentQuestionsPage + 1
            }))
        }
    }
    handlePrevPage = () => {
        if (this.state.currentQuestionsPage > 0) {
            this.setState( (prevState) => ({
                currentQuestionsPage: prevState.currentQuestionsPage - 1
            }))
        }
    }

    render() {
        const { changePage, ClickQuestionTitle, questions } = this.props;
        const { currentQuestionsPage } = this.state
        const questionsPerPage = 5
        const startIndex = currentQuestionsPage * questionsPerPage;
        const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);
        // this the regular expression for extract hyperLink
        const reg = /\[(.*?)\]\((.*?)\)/g;
        function formatHyperlink(text){
            text = text.replace(reg, (match, t, url) => {
                return `${t}`;
            });
            return text;
        };

        return (
            <div id='pose_questions'>
                {currentQuestions.length > 0? (currentQuestions.map((q) => (
                    <div id='pose_question' key={q._id}>
                        <AnsView q={q}/>
                        <div className='question'>
                            <h2 id={q._id} 
                            style={{ cursor: 'pointer' }} 
                            onClick={()=>{
                                ClickQuestionTitle(q._id);
                                changePage('AnswersPage')}}>
                                {formatHyperlink(q.title)}
                            </h2>
                            <h4 id={q._id}
                            style={{paddingLeft:'10px', color:"black"}}>
                                {formatHyperlink(q.summary)}
                            </h4>
                            <Attributes tags={q.tags}/>

                        </div>
                        <PoseQuestionTime question={q}/>
                    </div>
                ))): (
                    <h2 style=
                    {{
                        paddingLeft : '5%',
                        paddingTop: '10px',
                    }}>
                        No Questions Found
                    </h2>
                )}
                <div id='questionListBtns'>
                    {startIndex !== 0 ?<button className = "questionListBtn" onClick={this.handlePrevPage}>prev</button> : null}
                    {startIndex < questions.length - 5 ?<button className = "questionListBtn" onClick={this.handleNextPage}>next</button> : null}
                </div>
            </div>
        );
    }
}

export default class QuestionsPage extends React.Component {
    // constructor(props){
    //     super(props);
    // }
    render(){
        const { data, changePage, ClickQuestionTitle, sort, ClickSortButton, search, username, setLoginAlert, email } = this.props;
        let questions = data;
        if (questions[0] === 'Loading...'){
            return;
        }

        if (search !== "" ){
            questions = searchQuestionsByText(search, data);
        }

        return(
            <div id='frame'>
                <QuestionsPageHeader
                questions={questions}
                changePage={changePage}
                ClickSortButton={ClickSortButton}
                search={search}
                username={username}
                setLoginAlert={setLoginAlert}
                email={email}/>

                <QuestionList
                questions={questions}
                changePage={changePage} 
                ClickQuestionTitle={ClickQuestionTitle}
                sort={sort}
                search={search}  />
            </div>
        )
    }
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

  // search text and tags
  const searchQuestionsByText = (searchText, data) => {
    // let questions;
    // if (data.questions != undefined){ // potentially data will be question in the data
    //     questions = data.questions;
    // }
    // else{
    //     questions = data;
    // }
    let questions = data
    let searched_questions = questions.filter(q=>is_matched(q, searchText));
    return searched_questions;
  }
  function is_matched(question, string){
    const text = question.text.toLowerCase()
    const title = question.title.toLowerCase();
    const summary = question.summary.toLowerCase();
    const tags = question.tags.map(tag =>{
      return tag.name;
    })
    string = string.toLowerCase().trim();
    let stringList = string.split(/\s+/);
    const search_tags = stringList.filter(e => {
      return e.startsWith('[') && e.endsWith(']');

    }).map(tag => tag.slice(1, -1));


    const search_text = stringList.filter(e => {
      return !(e.startsWith('[') && e.endsWith(']'));
    })

    let is_search_text_match = search_text.length > 0 ? search_text.every((word) => {
      return (text.includes(word) || title.includes(word) || summary.includes(word));
    }) : false;
 
    let is_any_tag_match = search_tags.length > 0 ? search_tags.some(search_tag => {
      return tags.includes(search_tag);
    }) : false;

    return (is_search_text_match || is_any_tag_match);
  }