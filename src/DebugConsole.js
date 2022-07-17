import styled from "styled-components";

const StyledConsole = styled.div`
    background-color:black;
    position: fixed;
    top:20px;
    right:20px;
    padding: 20px;
    p {
        color:white;
        min-width:300px;
        margin:0;
    }

    button {
        background-color:red;
        border:1ps solid black;
    }
`

export const DebugConsole = (props) => {
    return(
        <StyledConsole>
            {props.debugText.map((text,index) => {
                return(<p>{text}</p>)
            })}
            <button onClick={() => {props.setDebugText([])}}>Close</button>
        </StyledConsole>
    );
}