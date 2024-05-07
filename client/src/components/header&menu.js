function Header(props){
    const { handleSearch, username, logoutHandler, reputation, handleChangePage, email} = props; 
    const handleSearchChange = (e) =>{
        if (e.key === "Enter"){ 
            handleSearch(e.target.value);
        }
    }
    return(
        <div id='header'>
            <div id="username">
                {
                    email===''
                    ?<pre href="#" style={{ color: 'blue'}}>
                        {username}
                    </pre>
                    :<pre href="#" style={{ color: 'blue',cursor: 'pointer'}} onClick={(e) => {
                    handleChangePage("userProfilePage");}}>
                        {username}
                    </pre>
                }
                
                {/* check log in status */}
                {
                email===''
                ? <button id='logoutBtn' onClick={()=>logoutHandler()}>Sign In</button>
                :<>
                    <p style={{display: 'inline', fontSize:'15px'}}>reputation: {reputation}</p>
                    <button id='logoutBtn' onClick={()=>logoutHandler()}>Log out</button>
                </>
                }
            </div>
            <h1>Fake Stack Overflow</h1>
            <input placeholder="..." id='header_search_input' 
            onKeyDown={handleSearchChange}
            />
        </div>
    )
}

function Menu(props){
    const {activeBtn, handleClick } = props;
    return(
        <div id='menu'>
            <button type="button" 
            id={activeBtn === 'QuestionsBtn'?'Menu_btn_active':'Menu_btn_deactive'} 
            onClick={()=>handleClick('QuestionsBtn')}>
                Questions
            </button>

            <button type='button' 
            id={activeBtn === 'TagsBtn'?'Menu_btn_active':'Menu_btn_deactive'} 
            onClick={()=>handleClick('TagsBtn')}>
                Tags
            </button>
        </div>
    )
}

export {Header, Menu};