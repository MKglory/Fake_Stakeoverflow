import React from 'react'
import EditQuestionPage from './askQuestionPage.js'
import UpdateAnswerPage from './poseAnswerPage.js'

export default class editPage extends React.Component{
    // constructor(props){
    //     super(props)
    // }
    render(){
        const { MenuHandleClick, username, setLoginAlert, setCurrentPage, email, editData, tryModify, handleChangePage, clickQuestionQid, setEditData } = this.props;
        return(
            <>
                {tryModify === 'q'
                    ?<EditQuestionPage
                    MenuHandleClick={MenuHandleClick} 
                    username = {username}
                    setLoginAlert = {setLoginAlert}
                    setCurrentPage = {setCurrentPage}
                    email={email}
                    editData={editData}
                    setEditData={setEditData}/>
                    :<UpdateAnswerPage
                    changePage={handleChangePage}
                    qid={clickQuestionQid}
                    setLoginAlert = {setLoginAlert}
                    setCurrentPage = {setCurrentPage}
                    username={username}
                    email={email}
                    editData={editData}
                    setEditData={setEditData}/>
                }
            </>
        )
    }
}