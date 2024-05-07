import React from 'react';
import axios from 'axios';
import TagsPage from './tagsPage.js';


export default class UserProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: {
                memberSince: '',
                reputation: 0,
                questions: [],
                answers: [],
                tags: []
            },
            error: ''
        };
        this.fetchProfile = this.fetchProfile.bind(this);
    }

    async componentDidMount() {
        const { isAdmin } = this.props
        // setTimeout(this.fetchProfile, 500);
        await this.fetchProfile();
        if (isAdmin) {
            this.props.handleChangePage("adminProfilePage");
        }
    }

    async fetchProfile() {
        const { email, setIsAdmin, handleChangePage, setLoginAlert, setCurrentPage } = this.props;

        try {
            const response = await axios.get('http://localhost:8000/userProfilePage', {
                params: { email: email },
                withCredentials: true,
            });
            const { data } = response;
            this.setState({
                profile: {
                    memberSince: new Date(data.register_date_time).toLocaleDateString(),
                    reputation: data.reputation,
                    questions: data.questions,
                    answers: data.answers,
                    tags: data.tags,
                    tagsInformation: data.tagsInformation
                },
            });
            setIsAdmin(data.admin === 1);
            if (response.data.admin !== 0){
                handleChangePage('adminProfilePage')
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setLoginAlert('1');
            setCurrentPage('homePage');
            this.setState({ error: 'Failed to load profile data.' });
            // setTimeout(this.fetchProfile, 3000);
        }
    }

    handleDeleteQuestion = async (questionId) => {
        try {
            await axios.delete(`http://localhost:8000/questions/${questionId}`, { withCredentials: true });
            this.fetchProfile();
        } catch (err) {
            console.error('Failed to delete question:', err);
        }

    }
    handleDeleteAnswer = async (answerId) => {
        try {
            await axios.delete(`http://localhost:8000/answers/${answerId}`, { withCredentials: true });
            this.fetchProfile();
        } catch (err) {
            console.error('Failed to delete answer:', err);
        }
    }

    handleDeleteTag = async (tagId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/tags/${tagId}`, { withCredentials: true });
            if (response.data.error) {
                alert("This tag already been used by other users.")
            }
            this.fetchProfile();
        } catch (error) {
            console.error('Failed deleting tag:', error);
        }
    }

    render() {
        const { username, handleChangePage, setActiveBtn, setLoginAlert, setEditData, setTryModify, setSearch, MenuHandleClick } = this.props;
        const { error, profile } = this.state;
        if (error) {
            handleChangePage('homePage')
            setLoginAlert('1')
            return <p>{error}</p>;
        }
        const editQuestion = async (q) => {
            setTryModify('q');
            handleChangePage('editPage')
            setEditData(q);
        }
        const editAnswer = async (a) => {
            setTryModify('a');
            setEditData(a);
            handleChangePage('editPage')
        }

        return (
            <div id='UserProfile'>
                <h1>{username}  's Profile</h1>
                <p style={{fontWeight:'bold'}}>Member since: {profile.memberSince}</p>
                <p style={{fontWeight:'bold'}}>Reputation: {profile.reputation}</p>
                <h2>Your Questions:</h2>
                <div id='UserProfile-question'>
                    {profile.questions.length ? (
                        <ul>
                            {profile.questions.map(question => (
                                <li key={question._id} style={{paddingBottom: '10px'}}>
                                    <div>
                                        <div onClick={() => editQuestion(question)} style={{ cursor: "pointer", color: 'blue', display: 'inline-block' }}>{question.title}</div>
                                        <button href="#" style={{ cursor: "pointer", display: 'inline-block', marginLeft: "10px" }} onClick={() => this.handleDeleteQuestion(question._id)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No questions posted yet.</p>}
                </div>
                <h2>Your Answers:</h2>
                <div id='UserProfile-answer'>
                    {profile.answers.length ? (
                        <ul>
                            {profile.answers.map(answer => (
                                <li key={answer._id} style={{paddingBottom: '10px'}}>
                                    <div>
                                        <div onClick={() => editAnswer(answer)} style={{ cursor: "pointer", color: 'blue', display: 'inline-block' }}>{answer.text}</div>
                                        <button href="#" style={{ cursor: "pointer", display: 'inline-block', marginLeft: "10px" }} onClick={() => this.handleDeleteAnswer(answer._id)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No answers posted yet.</p>}
                </div>


                <h2>Your Tags:</h2>
                <div id='UserProfile-tags'>
                    {/* {profile.tags.length ? (
                        <ul>
                            {profile.tags.map(tag => (
                                <li key={tag._id}>
                                    {tag.name} - 
                                    <a href="#" onClick={() => handleChangePage("EditTagPage", tag._id)}>Edit</a> |
                                    <a href="#" onClick={() => this.handleDeleteTag(tag._id)}>Delete</a>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No tags created yet.</p>} */}
                    <TagsPage
                        inProfile='1'
                        data={profile}
                        changePage={handleChangePage}
                        checkTagsQuestion={setSearch}
                        MenuHandleClick={MenuHandleClick}
                        setLoginAlert={setLoginAlert}
                        username={username} 
                        fetchProfile={this.fetchProfile}
                        tagsInformation={this.state.profile.tagsInformation}/>
                </div>


                <div style={{paddingTop :"50px", marginBottom : "20px"}}>
                    <p style={{ display: 'inline', marginLeft: '10px', fontSize : '20px'  }}>Click Here To Return:</p>
                    <p style={{ color: 'blue', display: 'inline', marginLeft: '10px', cursor: "pointer", fontSize : '25px' }} onClick={(e) => {
                        e.preventDefault();
                        handleChangePage("QuestionsPage");
                        setActiveBtn('QuestionsBtn')
                    }}>
                        Questions Page
                    </p>
                </div>
            </div>
        );
    }
}