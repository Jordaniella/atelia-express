import styled from "styled-components";
import { Lightbulb, Rocket, Sparkles, Wind } from "lucide-react";
import { Link } from "react-router-dom";

const CLogo = styled.div`
  &.lg{
    a {
      font-size: 2rem;
    }
    .light-i {
      left: 53.5%;
      top: -60%;
    }
    .sparkles-i {
      top: -37%;
      left: 67%;
    }
  }
  &.md{
    a {
      font-size: 1.5rem;
    }
    .light-i {
      left: 52.6%;
      top: -45%;
    }
    .sparkles-i {
      top: -27%;
      left: 58%;
    }
    &.left-logo {
      .light-i {
        left: 55.6%;
        top: -55%;
      }
      .sparkles-i {
        top: -34%;
        left: 68%;
      }
    }
  }
  &.sm{
    a {
      font-size: 1.25rem;
    }
    .light-i {
      left: 53.5%;
      top: -45%;
    }
    .sparkles-i {
      top: -27%;
      left: 67%;
    }
  }
  a {
    // gap: 12px;
    position: relative;
    font-weight: 900;
    color: var(--text-primary);
    letter-spacing: 2px;
    span {
      color: var(--brand-primary);
      &:first-child {
        font-style: italic;
      }
    }
    svg {
      position: absolute;
    }
  }
`;

type Props = {
  size?: "sm" | "md" | "lg";
  isCenter?: boolean;
};

const Logo = ({size = "lg", isCenter=false}:Props) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };
  return (
    <CLogo className={`${size} ${isCenter ? "center-logo" : "left-logo"}`}>
      <Link to="/" className={`${isCenter ? "flex items-center content-center" : ""}`}>
        {/* <div className="atelia-logo"></div> */}
        {/* <p className="mt-3"> */}
        {/* <span>A</span> */}
        <span>A</span>TEL
        <Sparkles className={`${size==="lg" ? "w-4 h-4": "w-2.5 h-2.5"} text-[var(--brand-primary)] sparkles-i`} />
        {/* <Rocket
          className="w-10 h-10 text-[var(--brand-primary)] sparkles-i"
          style={{ transform: "rotate(-44deg)" }}
        /> */}
        <Lightbulb
          className={`${sizeClasses[size]} text-[var(--brand-primary)] light-i`}
          // style={{ transform: "rotate(-44deg)" }}
        />
        <span>i</span>A{/* </p> */}
      </Link>
    </CLogo>
  );
};

export default Logo;
