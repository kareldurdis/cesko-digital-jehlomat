import React, { FC, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ZadatKod from './components/ZadatKod';
import ZobrazitStav from './components/ZobrazitStav';
import { Header } from 'Components/Header/Header';
import { SyringeStateType, syringeStates, STEPS } from 'screens/TrackovaniNalezu/TrackovaniNalezu.config';
import { useMediaQuery } from '@mui/material';
import { media } from 'utils/media';

interface Props {}

const TrackovaniNalezu: FC<Props> = () => {
    const [currentStep, setCurrentStep] = useState<STEPS>(STEPS.ZadatKod);
    const [syringeState, setSyringeState] = useState<SyringeStateType>(SyringeStateType.ANNOUNCED);
    const history = useHistory();
    const isMobile = useMediaQuery(media.lte('mobile'));
    const height = isMobile ? '100vh' : 'auto';

    const handleOnClickBack = () => {
        history.goBack();
    };

    const handleStepChange = (newStep: STEPS) => {
        setCurrentStep(newStep);
    };

    const handleNewSyringeState = (syringeState: SyringeStateType) => {
        setSyringeState(syringeState);
    };

    const renderContent = () => {
        switch (currentStep) {
            case STEPS.ZobraitStav:
                return <ZobrazitStav syringeState={syringeStates[syringeState]!} height={height} />;
            default:
                return <ZadatKod onClickBack={handleOnClickBack} handleStepChange={handleStepChange} handleNewSyringeState={handleNewSyringeState} height={height} />;
        }
    };

    return (
        <>
            <Header mobileTitle="" />
            {renderContent()}
        </>
    );
};

export default TrackovaniNalezu;
