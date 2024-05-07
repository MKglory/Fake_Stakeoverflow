import React, { Component } from 'react';
import axios from 'axios';
import UserProfilePage from "./userProfilePage.js"


class AdminProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            error: '',
            otherProfile: 0,
            otherAccount: null
        };

        this.handleDeleteUser = this.handleDeleteUser.bind(this);
    }

    async componentDidMount() {
        const { setLoginAlert, setCurrentPage } = this.props
        try {
            const response = await axios.get('http://localhost:8000/admin', { withCredentials: true });
            this.setState({ users: response.data.users });
        } catch (err) {
            setLoginAlert('1')
            setCurrentPage('homePage')
            this.setState({ error: 'Failed to load users' });
        }
    }

    async handleDeleteUser(userId) {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:8000/users/${userId}`, { withCredentials: true });
                this.componentDidMount();
            } catch (err) {
                this.setState({ error: 'Failed to delete user' });
            }
        }
    }

    async userProfile(user){
        this.setState({
            otherProfile: 1,
            otherAccount: user
        })
    }

    render() {
        const { users, error, otherProfile, otherAccount } = this.state;
        const nonAdminUsers = users.filter((account) => account.admin === 0)
        const { username, email, handleChangePage, setActiveBtn, setLoginAlert, setEditData, setTryModify, setSearch, MenuHandleClick, isAdmin, setIsAdmin, setCurrentPage} = this.props;
        return (
            otherProfile === 0
            ? <div id='AdminProfile'>
                <h1>Admin Profile as "{username}"</h1>
                {error && <p>{error}</p>}
                <UserProfilePage
                username = {username}
                email = {email}
                handleChangePage = {handleChangePage}
                setActiveBtn={setActiveBtn}
                setLoginAlert={setLoginAlert}
                setEditData={setEditData}
                setTryModify={setTryModify}
                setSearch={setSearch}
                MenuHandleClick={MenuHandleClick}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                setCurrentPage = {setCurrentPage}/>
                <ul>
                <p>Other Users</p>
                    {nonAdminUsers.length ? (
                        nonAdminUsers.map(user => (
                            <li key={user._id} style={{marginTop: '20px',marginRight: '10px', padding: '10px', border:"2px dotted black", backgroundColor: 'white'}}>
                                <p style={{color:'blue', cursor: 'pointer'}} onClick={() => this.userProfile(user)}>
                                    Username: {user.username} - Gmail:({user.email}) - Reputation: {user.reputation} - Member since: {new Date(user.register_date_time).toLocaleDateString()}
                                </p>
                                <button 
                                onClick={() => this.handleDeleteUser(user._id)}
                                style={{margin:'20px', borderRadius:'10px', color: 'white', backgroundColor:'rgb(0, 153, 255)'}}>
                                    Delete Account
                                </button>
                            </li>
                        ))
                    ) : <li style={{marginTop: '20px',marginRight: '10px', padding: '10px', border:"2px dotted black", backgroundColor: 'white'}}>No users found</li>}
                </ul>
            </div>
            
            :
            <>
                <UserProfilePage
                username = {otherAccount.username}
                email = {otherAccount.email}
                handleChangePage = {handleChangePage}
                setActiveBtn={setActiveBtn}
                setLoginAlert={setLoginAlert}
                setEditData={setEditData}
                setTryModify={setTryModify}
                setSearch={setSearch}
                MenuHandleClick={MenuHandleClick}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
                setCurrentPage = {setCurrentPage}/>
                {/* <p style={{ color: 'blue', display: 'inline', marginLeft: '10px', cursor: "pointer", fontSize : '25px' }} onClick={(e) => {
                            e.preventDefault();
                            handleChangePage("QuestionsPage");
                            setActiveBtn('QuestionsBtn')
                        }}>
                            Questions Page
                        </p> */}
                <button style={{ fontSize : '20px', display:'inline', float:'right', margin:"30px" }}
                onClick={()=>{
                    handleChangePage('userProfilePage')
                }}>
                    Return
                </button>
            </>
        );
    }
}

export default AdminProfilePage;
