import React from 'react';
import axios from 'axios';
import { useState } from 'react';


export default class TagsPage extends React.Component {
    // constructor(props){
    //     super(props);
    // }
    render() {
        const { data, changePage, checkTagsQuestion, MenuHandleClick, setLoginAlert, username, inProfile, fetchProfile, tagsInformation, email } = this.props;

        async function showAllTagsQuestion(tagName) {
            tagName = '[' + tagName + ']';
            MenuHandleClick('');
            await checkTagsQuestion(tagName);
            changePage("QuestionsPage");
        }
        return (
            <div id="frame">
                {inProfile
                    ? ""
                    : <TagsHeader data={data} changePage={changePage} setLoginAlert={setLoginAlert} username={username} email={email} />
                }
                <TagsContainer
                    data={data}
                    showAllTagsQuestion={showAllTagsQuestion}
                    inProfile={inProfile}
                    fetchProfile={fetchProfile}
                    tagsInformation={tagsInformation} />
            </div>
        )
    }
}
function TagsHeader(props) {
    const { email } = props
    let tags = props.data.tags;
    let num_tags = tags ? tags.length : 0;
    const { changePage, setLoginAlert, username } = props;
    const handle_AskQuestionClick = () => {
        if (username === 'Guest') {
            changePage('login')
            setLoginAlert('1')
        }
        else {
            changePage('AskQuestionPage');
        }
    };
    return (
        <div id="tags_header" className="tags_header">
            <h2 id="num_tags" className="num_tags">{num_tags} {num_tags === 1 ? 'tag' : 'tags'}</h2>
            <h2>All Tags</h2>
            <div id="tags_askQuestion_div" className="tags_askQuestion_div">
                {email
                ?<button id="tags_askQuestion" className="tags_askQuestion"
                    onClick={() => handle_AskQuestionClick()}>
                    Ask Question
                </button>
                :null
            }
            </div>
        </div>
    )
}
function TagsContainer(props) {
    // const { questions, tags } = props.data;
    const { showAllTagsQuestion, inProfile, fetchProfile, data, tagsInformation } = props;
    const [editTagId, setEditTagId] = useState(null);
    let tags = data.tags;
    let questions;
    if (tagsInformation) {
        // tags = tagsInformation.tags
        questions = tagsInformation.questions
    }
    else {
        // tags = data.tags
        questions = data.questions
    }
    const handleDeleteTag = async (tagId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/tags/${tagId}`, { withCredentials: true });
            if (response.data.error) {
                alert("This tag already been used by other users.")
            }
            fetchProfile();
        } catch (error) {
            console.error('Failed deleting tag:', error);
        }
    }
    const handleClickEdit = (tagId) => {
        setEditTagId(tagId)
    }
    const handleEditTag = async (tagId) => {
        let id = 'input' + tagId;
        const tagText = document.getElementById(id).value.trim();
        if (tagText.length === 0) {
            alert("This tag should have a name.")
        }
        else {
            try {
                const response = await axios.post(`http://localhost:8000/editTags`, { tagId: tagId, tagText: tagText }, { withCredentials: true });
                if (response.data.error) {
                    alert("This tag already been used by other users.")
                }
                setEditTagId(null)
                fetchProfile();
            } catch (error) {
                console.error('Failed deleting tag:', error);
            }
        }
    }
    const container = tags
        ? tags.map(tag => {
            // find the number of qustion with this tags
            let num_question = questions.reduce((num, question) => {
                return (num + (question.tags.includes(tag._id) ? 1 : 0));
            }, 0)
            return (
                <div className={inProfile ? 'profile_tags_item' : "tags_item"} key={tag._id}>
                    <p id={tag._id}
                        onClick={() => showAllTagsQuestion(tag.name)}
                        style={{
                            color: 'blue',
                            textDecoration: 'underline',
                            cursor: 'pointer'
                        }}>
                        {tag.name}</p>
                    <p>{num_question} {num_question === 1 ? 'question' : 'questions'}</p>
                    {inProfile
                        ?
                        <>
                            <button onClick={() => handleDeleteTag(tag._id)}>Delete</button>
                            {editTagId && editTagId === tag._id
                                ?
                                <>
                                    <input id={`input${tag._id}`} style={{ width: "50px" }} />
                                    <button onClick={() => handleEditTag(tag._id)}>Submit</button>
                                </>

                                : <button onClick={() => handleClickEdit(tag._id)}>Edit</button>
                            }

                        </>
                        : null
                    }

                </div>
            )
        })
        : "No new tags created yet."

    return (
        <div id={inProfile ? "profile_tags_container" : "tags_container"} className={inProfile ? "profile_tags_container" : "tags_container"}>
            {container}
        </div>
    )
}