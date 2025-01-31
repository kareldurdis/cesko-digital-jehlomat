import React, { FunctionComponent, useCallback } from 'react';
import { AxiosResponse } from 'axios';
import dayjs from 'dayjs';
import { styled } from '@mui/system';
import { Syringe } from 'screens/Nalezy/types/Syringe';

import { ActionButton } from 'screens/Nalezy/Components/Link';
import Delete from 'screens/Nalezy/Components/Delete';
import { ReactComponent as SyringeIcon } from 'assets/icons/syringe-line.svg';
import { API } from 'config/baseURL';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState } from 'store/user';
import { paginationState } from 'screens/Nalezy/store';
import { useConfirmationModalContext } from 'context/confirmation-modal-context';
import texts from 'screens/Nalezy/texts';

const List = styled('ul')({
    margin: 0,
    padding: 0,
    listStyle: 'none',

    li: {
        borderBottom: '1px solid #dee2e6',
        margin: 0,

        '&:last-child': {
            borderBottom: 'none',
        },
    },
});

interface LinksProps {
    syringe: Syringe;
    onClose?: () => void;
}

const Links: FunctionComponent<LinksProps> = ({ syringe, onClose }) => {
    const auth = useRecoilValue(userState);
    const setPaging = useSetRecoilState(paginationState);
    const confirmationModal = useConfirmationModalContext();

    const handleDemolish = useCallback(
        (ev: React.MouseEvent<HTMLButtonElement>) => {
            ev.stopPropagation();

            const payload = {
                ...syringe,
                demolishedAt: +dayjs(),
                demolishedBy: {
                    id: auth?.id,
                },
            };

            API.put(`/syringe`, payload)
                .then((response: AxiosResponse) => {
                    if (response.status !== 200) throw new Error('Unable to update syringe finding');

                    setPaging(state => ({ ...state }));
                })
                .catch(() => {
                    confirmationModal!
                        .show({
                            title: texts.ACTIONS__DEMOLISH__ERROR,
                            confirmText: 'Ok',
                        })
                        .catch(() => console.log('Unable to proceed modal response'));
                })
                .finally(() => {
                    if (typeof onClose === 'function') onClose();
                });
        },
        [auth, confirmationModal, onClose, setPaging, syringe],
    );

    return (
        <List>
            <li>
                <ActionButton onClick={handleDemolish}>
                    <span>Zlikvidovat nález</span>
                    <SyringeIcon style={{ width: '20px', height: '20px' }} />
                </ActionButton>
            </li>
            <li>
                <Delete syringe={syringe} />
            </li>
        </List>
    );
};

export default Links;
