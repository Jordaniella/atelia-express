import { Check } from "lucide-react";
import styled from "styled-components";

const CStepperContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  .steps {
    display: flex;
    align-items: center;
    gap: 5px;
    &.completed,
    &.active {
      .item {
        opacity: 1;
      }
    }
    &.active {
      .item {
        border: 2px solid var(--brand-primary);
        background: transparent;
      }
    }
    &.completed {
      .divider::after {
        opacity: 1;
      }
    }
    .item {
      width: 24px;
      height: 24px;
      background: var(--brand-primary);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0.5;
    }
    .divider {
      position: relative;
      width: 50px;
      &::before,
      &::after {
        content: "";
        position: absolute;
        top: 50%;
        width: 25px;
        height: 3px;
        background: var(--brand-primary);
        border-radius: 4px;
      }
      &::before {
        left: 2px;
      }
      &::after {
        right: 0;
        opacity: 0.5;
      }
    }
  }
`;

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const allSteps = 3;
  return (
    <CStepperContainer>
      {Array.from({ length: allSteps }).map((_, index) => (
        <div
          className={`steps ${index < currentStep ? "completed" : index === currentStep ? "active" : ""}`}
        >
          <div className="item">
            {index < currentStep && (
              <Check className="w-5 h-5 text-[var(--bg-primary)]" />
            )}
            {index === currentStep && (
              <div className="w-3 h-3 rounded-full bg-[var(--brand-primary)]"></div>
            )}
          </div>
          {index + 1 < allSteps && <div className="divider"></div>}
        </div>
      ))}
    </CStepperContainer>
  );
};
export default Stepper;
