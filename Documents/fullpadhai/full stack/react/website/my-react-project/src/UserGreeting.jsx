function UserGreeting(props){

    const welcomeMessage = <h2 className="welcome-message">welcome {props.username}</h2>
    const loginPrompt = <h2 className="login-prompt">please login to continue</h2>

    return(props.isLoggedIn ? welcomeMessage : loginPrompt);

}
export default UserGreeting