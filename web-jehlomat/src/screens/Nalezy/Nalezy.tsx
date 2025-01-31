import React, { FunctionComponent, useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useLocation, matchPath, useRouteMatch } from 'react-router';
import { Box, Container } from '@mui/material';
import { AxiosResponse } from 'axios';
import { useRecoilValue } from 'recoil';
import { API } from 'config/baseURL';
import { Header } from 'Components/Header/Header';
import { SyringeReadModel } from 'screens/Nalezy/types/SyringeReadModel';
import { Loader } from 'utils/Loader';
import FilterByRange from 'screens/Nalezy/Components/FilterByRange';
import FilterByReporter from 'screens/Nalezy/Components/FilterByReporter';
import FilterByState from 'screens/Nalezy/Components/FilterByState';
import Table from 'screens/Nalezy/Components/Table';
import Controls from 'screens/Nalezy/Components/Controls';
import Button from 'screens/Nalezy/Components/Button';
import TextHeader from 'screens/Nalezy/Components/TextHeader';
import Map from 'screens/Nalezy/Components/Map';
import DarkButton from 'screens/Nalezy/Components/DarkButton';
import Filters from 'screens/Nalezy/Components/Filters';
import HorizontalContainer from 'screens/Nalezy/Components/HorizontalContainer';
import Page from 'screens/Nalezy/Components/Page';
import { filteringState, paginationState, sortingState } from 'screens/Nalezy/store';

const Nalezy: FunctionComponent = () => {
    const [loader, setLoader] = useState<Loader<SyringeReadModel>>({});
    const [filters, setFilters] = useState(false);
    const history = useHistory();
    const location = useLocation();
    const match = useRouteMatch();

    const sorting = useRecoilValue(sortingState);
    const filtering = useRecoilValue(filteringState);
    const paging = useRecoilValue(paginationState);

    const isMapMatch = matchPath(location.pathname, '/nalezy/mapa');
    const isTableMatch = matchPath(location.pathname, '/nalezy');

    const isMap = isMapMatch?.isExact;
    const isTable = isTableMatch?.isExact;

    useEffect(() => {
        const filter = {
            ordering: sorting,
            filter: filtering,
            pageInfo: paging,
        };

        const load = async () => {
            const response: AxiosResponse<SyringeReadModel> = await API.post('/syringe/search', filter);
            if (response.status !== 200) throw new Error('Unable to load data');

            return response.data;
        };

        load()
            .then(data => setLoader({ resp: data }))
            .catch(e => {
                setLoader({ err: e });
                console.warn(e);
            });
    }, [sorting, filtering, paging]);

    return (
        <>
            <Header mobileTitle="Seznam zadaných nálezů" />

            <Page>
                <Container>
                    <Box mt={5} mb={2} display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <TextHeader>Seznam zadaných nálezů</TextHeader>
                        </Box>
                        <Controls>
                            <Button>Export</Button>
                            <Button onClick={() => setFilters(s => !s)}>Filtrovat</Button>
                            {isTable && <DarkButton onClick={() => history.push('/nalezy/mapa')}>Mapa</DarkButton>}
                            {isMap && <DarkButton onClick={() => history.push('/nalezy')}>Seznam</DarkButton>}
                        </Controls>
                    </Box>
                </Container>
                {filters && (
                    <Filters>
                        <HorizontalContainer>
                            <FilterByRange />
                            <FilterByReporter />
                            <FilterByState />
                        </HorizontalContainer>
                    </Filters>
                )}
                <Switch>
                    <Route path={`${match.path}/`} exact={true}>
                        <Table loader={loader} />
                    </Route>
                    <Route path={`${match.path}/mapa/`} exact={true}>
                        <Map loader={loader} />
                    </Route>
                </Switch>
            </Page>
        </>
    );
};

export default Nalezy;
