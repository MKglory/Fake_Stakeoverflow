import React from 'react';
import axios from 'axios';

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      errors: {}
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (e) => {
    const { formData } = this.state;
    this.setState({
      formData: {
        ...formData,
        [e.target.name]: e.target.value
      }
    });
  };

  validateForm() {
    const { name, email, password, confirmPassword } = this.state.formData;
    let formErrors = {};
    if (!name.trim()) {
      formErrors.name = "Name cannot be empty.";
    }
    // const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!emailRegex.test(email.trim())) {
      formErrors.email = "Please enter a valid email address.";
    }
    if (!password.trim()) {
      formErrors.password = "Password cannot be empty.";
    }
    if (name.trim()) {
      const names = name.trim().split(" ");
      const firstName = names[0];
      const lastName = names.length > 1 ? names[1] : "";
      if (password.includes(firstName) || (lastName && password.includes(lastName))) {
        formErrors.password = "Password should not contain your first or last name.";
      }
    }
    if (email.trim().split('@')[0] && password.includes(email.trim().split('@')[0])) {
      formErrors.password = "Password should not contain your email.";
    }
    if (password !== confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match.";
    }

    return formErrors;
  }


  async handleSubmit(e) {
    e.preventDefault();
    const formErrors = this.validateForm();
    if (Object.keys(formErrors).length === 0) {
      try {
        console.log(this.state.formData)
        const response = await axios.post('http://localhost:8000/register', this.state.formData, {
          withCredentials: true
        });

        console.log("Account created", response.data);
        this.props.handleChangePage("login");
      } catch (error) {
        console.log(error.response.data.error);
        this.setState({ errors: { api: error.response.data.error } });

      }
    } else {
      this.setState({ errors: formErrors });
    }
  }

  render() {
    const { formData, errors } = this.state;
    return (
      <div id="home">
        <div style={{ textAlign: 'center' }}>
          <h1>Welcome to Fake Stack Overflow</h1>
        </div>
        <div id='registerBox'>
          <form onSubmit={this.handleSubmit}>
            <h3>UserName</h3>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={this.handleChange}
              placeholder="Name"
            />
            <h3>Email</h3>
            <input
              //type="email"
              name="email"
              value={formData.email}
              onChange={this.handleChange}
              placeholder="Email"
            />
            <h3>Password</h3>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={this.handleChange}
              placeholder="Password"
            />
            <h3>Reenter the Password</h3>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={this.handleChange}
              placeholder="Confirm Password"
            />
            {errors && Object.keys(errors).length > 0 && (
              <p style={{ color: 'red' }}>{errors[Object.keys(errors)[0]]}</p>
            )}
            <div id="homeButton">
              <button type="submit">Sign Up</button>
            </div>
            <div>
              <p>Want to return to home page?
                <p style={{ color: 'blue', cursor:'pointer', display: 'inline', marginLeft:'10px'}} onClick={(e) => {
                  this.props.handleChangePage("homePage");
                }}>Home</p>
              </p>
            </div>
          </form>
        </div >
      </div >
    );
  }
}
