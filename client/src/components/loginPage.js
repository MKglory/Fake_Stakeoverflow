import React from 'react';
import axios from 'axios';

export default class LoginPage extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            email: "",
            password:"",
            error: ""
        }
        this.handleLogin = this.handleLogin.bind(this);
        this.handleGuestUser = this.handleGuestUser.bind(this);
        this.checkSession();
    }
    handleEmailChange = (e) => {
        this.setState({ email: e.target.value.trim() });
    };

    handlePasswordChange = (e) => {
        this.setState({ password: e.target.value.trim() });
    };
    async handleLogin(e){
        const { email, password } =  this.state;
        const { handleChangePage, setUsername, setActiveBtn, setLoginAlert, setReputation, setEmail } = this.props
        e.preventDefault();
        if ( email && password){
            this.setState({error: ""})
            try{
                // Send a POST request to the server for login
                const response = await axios.post("http://localhost:8000/login", {
                    email,
                    password,
                }, {
                    withCredentials: true
                });
                if (response.data.error){
                    this.setState({error: response.data.error})
                }
                else{
                    setUsername(response.data.username);
                    setReputation(response.data.reputation)
                    setEmail(response.data.email);
                    setActiveBtn('QuestionsBtn');
                    handleChangePage("QuestionsPage");
                    setLoginAlert('0')
                }
            } catch(error) {
                handleChangePage('homePage')
                setLoginAlert('1')
            }
        }
        else if (!email){
            this.setState({error: "email can not be empty"})
        }
        else{
            this.setState({error: "password can not be empty"})

        }
    }
    handleGuestUser(){
        const { handleChangePage, setUsername, setActiveBtn, setEmail } = this.props
        setUsername('Guest');
        setActiveBtn('QuestionsBtn');
        handleChangePage("QuestionsPage");
        setEmail("");
    }
    checkSession = async () => {
        const { handleChangePage, setUsername, setActiveBtn, setReputation, setEmail } = this.props
        try {
            const response = await axios.get('http://localhost:8000/check-session', { withCredentials: true });
                if (response.data.isLoggedIn) {
                    this.setState({ isLoggedIn: true, user: response.data.user });
                    handleChangePage('QuestionsPage');
                    setUsername(response.data.user.username);
                    setReputation(response.data.user.reputation);
                    setEmail(response.data.user.email);
                    setActiveBtn('QuestionsBtn')
                }
        } catch (error) {
            console.error('Session check failed:', error);
        }
    };

    render(){
        const { loginAlert } = this.props
        const { email, password, error } =  this.state;
        return(
            <>
                <div id="home">
                    <div style={{textAlign: 'center'}}>
                        <h1>Welcome to Fake Stack Overflow</h1>
                    </div>
                    <div id='loginBox'>
                        <form onSubmit={this.handleLogin}>
                            <div>
                                <h3>Email</h3> 
                                <input
                                    value={email}
                                    id = "email"
                                    onChange={this.handleEmailChange}>
                                </input>
                            </div>
                            <div>
                                <h3>Password</h3>
                                <input
                                    type = "password"
                                    value={password}
                                    id = "password"
                                    onChange={this.handlePasswordChange}>
                                </input>
                            </div>
                            <div>
                                <p style={{color:'red'}}>{error}</p>
                            </div>
                            <div id="homeButton">    
                                <button type='submit'>Log In</button>  
                                <button onClick={this.handleGuestUser}>As a Guest</button>                   
                            </div>
                            <div>
                                <div style={{marginTop:'20px'}}>Dont have account? 
                                    <p style={{color:'blue', cursor: 'pointer', display:'inline', marginLeft: '10px'}} onClick={(e)=>{
                                        e.preventDefault();
                                        this.props.handleChangePage('registerPage');
                                    }}>Sign Up</p>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
                {loginAlert !== "0"
                    ?<div id="loginAlter">
                        <p>You must be logged in to ask a question on Fake Stack Overflow </p>
                    </div>
                    : null
                }
            </>
        )
    }
}
