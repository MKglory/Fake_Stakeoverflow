import { useState } from 'react';
import axios from 'axios';
import {Header, Menu} from './header&menu.js';
import QuestionsPage from './questionsPage.js'
import AnswersPage from './answerPage.js'
import TagsPage from './tagsPage.js';
import AskQuestionPage from './askQuestionPage.js'
import PoseQuestionPage from './poseAnswerPage.js'
import Login from "./loginPage.js"
import HomePage from "./homePage.js"
import RegisterPage from "./registerPage.js"
import UserProfilePage from "./userProfilePage.js"
import EditPage from "./editPage.js"
import AdminProfilePage from "./adminProfilePage.js"



var clickQuestionQid = "";
var sort = 'Newest';

export default function FakeStackOverflow() {
  // check which page I should render
  const [currentPage, setCurrentPage] = useState('homePage');
  const [search, setSearch] = useState("");
  const [activeBtn, setActiveBtn] = useState('QuestionsBtn') //menu button
  const [data, setData] = useState(['Loading...']); // State to hold fetched data
  const [username, setUsername] = useState("Guest");
  const [email, setEmail] = useState("");
  const [loginAlert, setLoginAlert] = useState("0");
  const [reputation, setReputation] = useState('0');
  const [editData, setEditData] = useState('')
  const [tryModify, setTryModify] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  // useEffect(() => {
  //   fetchData(currentPage);
  // },[]);
  const fetchData = async (currentPage) => {
    try {
      if (currentPage === 'AskQuestionPage' || currentPage === 'PoseAnswerPage' || currentPage === 'login' || currentPage === 'homePage' ||
          currentPage === 'registerPage' || currentPage === 'userProfilePage' || currentPage === 'editPage'  || currentPage === 'adminProfilePage'){
        return
      }
      const response = await axios.get(`http://localhost:8000/${currentPage}`, {
        params: {
          sort: sort,
          questionId: clickQuestionQid
        }, withCredentials: true
      });
      // increment specific question views
      if (currentPage === 'AnswersPage'){
        incrementViews(data, clickQuestionQid);
      }
      setData(response.data)
      // data = response.data
    } catch (error) {
      setLoginAlert('1')
      setCurrentPage('homePage')
      return ('error')
    }
  };


  // handle the button color when I clicked the buttons
  const MenuHandleClick = (btn) => {
    setActiveBtn(btn);
    setSearch('');
    if (btn === 'QuestionsBtn'){
      handleChangePage('QuestionsPage')
    }
    else if (btn === 'TagsBtn'){
      handleChangePage('TagsPage')
    }
  }
  // Hanlder for switching page content
  const handleChangePage = async (dest) => {
    if (dest !== 'QuestionsPage' && dest !== 'TagsPage'){
       setActiveBtn("");
       setSearch("");
    }
    const response = await fetchData(dest);
    if (response !== "error"){
      setCurrentPage(dest);
      if (document.getElementById('header_search_input')){
        document.getElementById('header_search_input').value = "";
      }
      // setSort('Newest');
      sort = 'Newest'
    }

  }
  // For check specific question detail
  const clickQuestionTitleHandler = (qid) =>{
    // setClickQuestionQid(qid);
    clickQuestionQid = qid;
    document.getElementById('header_search_input').value = "";
  }
  // handle for the three sort buttons
  const clickSortButton = async (btn) => {
    // setSort(btn);
    sort = btn;
    await fetchData(currentPage);
  }
  // handle reading search bar input
  const handleSearch = async (value) =>{
    sort = 'Newest';
    await fetchData('QuestionsPage');
    setActiveBtn("");
    setSearch(value);
    setCurrentPage('QuestionsPage')
  }
  const incrementViews = async (data, id) => {
    // Find the question object with the matching ID
    const question = data.find(question => question._id === id);
    try {
        await axios.post("http://localhost:8000/IncrementViews", {
            views: question.views,
            id: question._id
        });
    } catch (error) {
        console.log("increment views error"); // Error handling
        setLoginAlert('1')
        setCurrentPage('homePage')
    }
  }
  // Handle logout
  const logoutHandler = async() => {
    try{
      await axios.post("http://localhost:8000/logout", {},{withCredentials: true})
    } catch (error){
      console.log("Fail to log out account");
      setLoginAlert('1')
      setCurrentPage('homePage')
    }
    setEmail('')
    setReputation(0)
    setLoginAlert('0')
    setUsername('Guest');
    handleChangePage("homePage");
    
  }
  
  // keep current page content
  let pageContent = '';
  if (currentPage === 'QuestionsPage'){
    pageContent = <QuestionsPage 
    changePage={handleChangePage} 
    data={data}
    ClickQuestionTitle={clickQuestionTitleHandler}
    sort = {sort}
    ClickSortButton={clickSortButton}
    search={search}
    email={email}
    username={username}
    setLoginAlert = {setLoginAlert}
    
    />
  }
  else if (currentPage === 'TagsPage'){
    pageContent = <TagsPage 
    changePage={handleChangePage} 
    data={data}
    checkTagsQuestion={setSearch}
    MenuHandleClick={MenuHandleClick}
    setLoginAlert = {setLoginAlert}
    username={username}
    email={email}/>
  }
  else if (currentPage === "AnswersPage"){
    pageContent = <AnswersPage 
    changePage={handleChangePage}
    data={data}
    qid={clickQuestionQid}
    ClickQuestionTitle={clickQuestionTitleHandler}
    setLoginAlert = {setLoginAlert}
    username={username}
    email={email}
    clickQuestionQid={clickQuestionQid}
    fetchData={fetchData}
    setReputation={setReputation}
    reputation={reputation}/>
  }   
  else if (currentPage === 'AskQuestionPage'){
    pageContent = <AskQuestionPage
    MenuHandleClick={MenuHandleClick} 
    username = {username}
    setLoginAlert = {setLoginAlert}
    setCurrentPage = {setCurrentPage}
    email={email}
    setEditData={setEditData}/>
  }
  else if (currentPage === "PoseAnswerPage"){
    pageContent = <PoseQuestionPage
    changePage={handleChangePage}
    qid={clickQuestionQid}
    setLoginAlert = {setLoginAlert}
    setCurrentPage = {setCurrentPage}
    username={username}
    email={email}
    setEditData={setEditData}/>
  }
  else if (currentPage === "login"){
    pageContent = <Login
    handleChangePage = {handleChangePage}
    setUsername = {setUsername}
    setActiveBtn ={setActiveBtn}
    loginAlert={loginAlert}
    setLoginAlert={setLoginAlert}
    setReputation={setReputation}
    setEmail={setEmail}/>
  }
  else if (currentPage === 'homePage'){
    pageContent = <HomePage
    handleChangePage = {handleChangePage}
    setActiveBtn ={setActiveBtn}
    setUsername={setUsername}
    loginAlert={loginAlert}
    setLoginAlert={setLoginAlert}/>
  }
  else if (currentPage === 'registerPage'){
    pageContent = <RegisterPage
    handleChangePage = {handleChangePage}/>
  }
  else if (currentPage === 'userProfilePage'){
    pageContent = <UserProfilePage
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
  }
  else if (currentPage === 'editPage'){
    pageContent = <EditPage
    MenuHandleClick={MenuHandleClick} 
    username = {username}
    setLoginAlert = {setLoginAlert}
    setCurrentPage = {setCurrentPage}
    email={email}
    editData={editData}
    tryModify={tryModify}
    handleChangePage={handleChangePage}
    clickQuestionQid={clickQuestionQid}
    setEditData={setEditData}/>
  }
  else if (currentPage === 'adminProfilePage'){
    pageContent = <AdminProfilePage
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

  }

  return (
    <div id='main' className='main'>
     {currentPage !== 'homePage' && currentPage !== 'login' && currentPage !== 'registerPage' && currentPage !== 'userProfilePage' && currentPage !== 'adminProfilePage' && (
        <>
          <Header search={search}
           setSearch={setSearch}
           handleSearch={handleSearch} 
           username={username} 
           logoutHandler={logoutHandler} 
           reputation={reputation} 
           handleChangePage = {handleChangePage}
           email={email}/>
          <Menu activeBtn={activeBtn} handleClick={MenuHandleClick} />
        </>
      )}
      {pageContent}
    </div>
  );
}




