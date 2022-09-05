import { useEffect, useState } from "react";
import styled from "styled-components";
import { keyframes } from "styled-components";

const InactiveButton = styled.button`
    display:flex;
    justify-content:center;
    align-items:center;
    flex-grow:1;
    font-size:1vw;
    margin:2px;
    padding:10px;
    border:2px solid rgba(0,0,0,0);
    border-radius:4px;
    background-color:rgba(0,0,0,0);
    color:rgb(170,170,170);
    :hover {
        cursor:pointer;
        background-color:rgb(10,10,10);
        color:white;
        border: 2px solid black;
    }
`;

const ActiveButton = styled(InactiveButton)`
    background-color:rgb(10,10,10);
    color:#F4B942;
    border: 2px solid black;

    :hover{
        color:#F5A80D;
    }
`;

export function FadeButton(props) {
    const [clicked,setClicked] = useState(false);
    const Button = clicked ? ActiveButton : InactiveButton;
    useEffect(() => {
        if(clicked) {
            setClicked(false);
        };
    },[clicked]);
    return(
        <Button onClick={(e) => {props.callback(); setClicked(true)}} onAnimationEnd={(e) => {setClicked(false)}}>
            {props.child}
        </Button>
    );
}

export function ToggleButton(props) {
    const Button = props.active ? ActiveButton : InactiveButton;
    return(
        <Button onClick={(e) => {props.callback()}}>
            {props.child}
        </Button>
    );
}

