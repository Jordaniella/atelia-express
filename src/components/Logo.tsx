import styled from "styled-components";
import { Lightbulb, Rocket, Sparkles, Wind } from "lucide-react";
import { Link } from "react-router-dom";

const CLogo = styled.div`
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    // gap: 12px;
    position: relative;
    font-size: 2rem;
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
    .light-i {
      left: 53.5%;
      top: -45%;
    }
    .sparkles-i {
      top: -27%;
      left: 67%;
    }
  }
  // .atelia-logo {
  //   border-radius: var(--radius-sm);
  //   // background-color: var(--brand-primary);
  //   padding: 14px;
  //   width: 54px;
  //   height: 54px;
  // }
`;

const Logo = () => {
  return (
    <CLogo>
      <Link to="/">
        {/* <div className="atelia-logo"></div> */}
        {/* <p className="mt-3"> */}
        {/* <span>A</span> */}
        <span>A</span>TEL
        <Sparkles className="w-4 h-4 text-[var(--brand-primary)] sparkles-i" />
        {/* <Rocket
          className="w-10 h-10 text-[var(--brand-primary)] sparkles-i"
          style={{ transform: "rotate(-44deg)" }}
        /> */}
        <Lightbulb
          className="w-12 h-12 text-[var(--brand-primary)] light-i"
          // style={{ transform: "rotate(-44deg)" }}
        />
        <span>i</span>A{/* </p> */}
      </Link>
    </CLogo>
  );
};

export default Logo;
