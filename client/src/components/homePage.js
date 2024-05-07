import React from 'react'
import axios from 'axios';


export default class HomePage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isLoggedIn: false, // Default to not logged in
            user: null, // Store user data if logged in
        };
        this.toLoginPage = this.toLoginPage.bind(this);
        this.toRegisterPage = this.toRegisterPage.bind(this);
        this.guestUser = this.guestUser.bind(this)
        this.checkSession();
    }
    toRegisterPage = () =>{
        const { handleChangePage } = this.props
        handleChangePage('registerPage');
    }
    toLoginPage = () =>{
        const { handleChangePage, setLoginAlert } = this.props
        handleChangePage('login');
        setLoginAlert('0')
    }
    guestUser = () => {
        const { handleChangePage, setActiveBtn, setLoginAlert, setUsername } = this.props
        handleChangePage('QuestionsPage');
        setActiveBtn('QuestionsBtn');
        setLoginAlert('0')
        setUsername("Guest");
    }
    // this will check do we have valid session
    checkSession = async () => {
        const { handleChangePage, setUsername, loginAlert } = this.props
        try {
            if (loginAlert === 0){
            const response = await axios.get('http://localhost:8000/check-session', { withCredentials: true });
                if (response.data.isLoggedIn) {
                    this.setState({ isLoggedIn: true, user: response.data.user });
                    handleChangePage('QuestionsPage');
                    setUsername(response.data.user);
                }
            }
        } catch (error) {
            console.error('Session check failed:', error);
        }
    };
    render(){
        const { loginAlert } = this.props
        return(
            <>
                <div id='home'>
                    <h1 style={{textAlign: 'center', fontSize: '30px', marginTop: "15%"}}>Welcome to Fake Stack Overflow</h1>
                    <div id = 'homePageBtn'>
                        <button onClick={this.toRegisterPage}>Register as a new user</button>
                        <button onClick={this.toLoginPage}>Login as an existing user</button>
                        <button onClick={this.guestUser}>Continue as a guest user</button>
                    </div>
                </div>
                {loginAlert !== "0"
                    ?<div id="loginAlter">
                        <p>Network communication error, please try later</p>
                    </div>
                    : null
                }
        </>
        )
    }
}
