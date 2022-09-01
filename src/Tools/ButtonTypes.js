import { useEffect, useState } from "react";
import styled from "styled-components";
import { keyframes } from "styled-components";

const inactiveColor = 'white';
const activeColor = 'black';

const InactiveButton = styled.button`
    display:flex;
    justify-content:center;
    align-items:center;
    flex-grow:1;
    font-size:1vw;
    margin:2px;
    padding:10px;
    border:1px solid rgba(40,40,40);
    border-radius:4px;
    background-color:${inactiveColor};
    color:${activeColor};
    :hover {
        cursor:pointer;
    }
`;

const ActiveButton = styled(InactiveButton)`
    background-color:${activeColor};
    color:${inactiveColor};
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

