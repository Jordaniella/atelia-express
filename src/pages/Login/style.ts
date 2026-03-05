import styled from "styled-components";

const Container = styled.div.attrs({
  className: "atel-container",
})`
  display: flex;
  justify-content: center;
  padding: 48px 0;
  width: 100vw;
  height: 100vh;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 48px;
  height: 100%;
  width: 100%;
  padding: 24px;
  &.atel-infos {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
  }
  .atel-login {
    // align-items: center;
    min-width: 500px;
    max-height: 600px;
    overflow-y: auto;
    background: var(--bg-secondary);
    position: relative;
    gap: 36px;
    display: flex;
    flex-direction: column;
    padding: 32px;
    border-radius: var(--radius-card);
    .error-submit {
      position: absolute;
      top: 0;
    }
    form {
      gap: 24px;
      display: flex;
      flex-direction: column;
    }
  }
`;

const CAuth = {
  Container,
  Content,
};

export default CAuth;
