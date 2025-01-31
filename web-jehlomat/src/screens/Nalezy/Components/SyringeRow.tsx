import React, { FunctionComponent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { styled } from '@mui/system';
import { Box } from '@mui/material';
import { Syringe } from 'screens/Nalezy/types/Syringe';
import ListItemMenu from 'screens/Nalezy/Components/ListItemMenu';
import RoundButton from 'screens/Nalezy/Components/RoundButton';
import SyringeState from 'screens/Nalezy/Components/SyringeState';
import SyringeDemolishDate from 'screens/Nalezy/Components/SyringeDemolishDate';
import Row from 'screens/Nalezy/Components/Row';

import { ReactComponent as EditIcon } from 'assets/icons/edit.svg';
import { ReactComponent as SyringeIcon } from 'assets/icons/syringe-line.svg';

interface SyringeRowProps {
    syringe: Syringe;
}

const Right = styled('td')({
    textAlign: 'right',
});

const SyringeRow: FunctionComponent<SyringeRowProps> = ({ syringe }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [edit, setEdit] = useState<Syringe | null>();

    const history = useHistory();

    const handleOpenActions = (syringe: Syringe) => (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.stopPropagation();

        setAnchorEl(ev.currentTarget);
        setEdit(syringe);
    };

    return (
        <Row syringe={syringe} onClick={() => history.push(`/nalezy/detail/${syringe.id}`)}>
            <td>
                <SyringeIcon />
            </td>
            <td>{syringe.location.obecName ?? syringe.location.obec}</td>
            <td>{syringe.location.okresName ?? syringe.location.okresName}</td>
            <td>{dayjs(syringe.createdAt * 1000).format('D. M. YYYY')}</td>
            <td>
                <SyringeDemolishDate syringe={syringe} />
            </td>
            <td>{syringe.createdBy?.username ?? '-'}</td>
            <td>
                <SyringeState syringe={syringe} />
            </td>
            <Right>
                <Box mr={1}>
                    <RoundButton onClick={handleOpenActions(syringe)}>
                        <EditIcon />
                    </RoundButton>
                    <ListItemMenu open={Boolean(anchorEl) && edit?.id === syringe.id} anchorEl={anchorEl!} onClickAway={() => setAnchorEl(null)} syringe={syringe} />
                </Box>
            </Right>
        </Row>
    );
};

export default SyringeRow;
