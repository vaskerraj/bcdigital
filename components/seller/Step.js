import React from 'react';
import { Steps } from 'antd';

const { Step } = Steps;

const StartStep = ({ activeStep }) => {
    return (
        <Steps current={activeStep}>
            <Step title="Company" />
            <Step title="Address" />
            <Step title="Bank Details" />
        </Steps >
    );
}

export default StartStep;
