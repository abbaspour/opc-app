import * as React from "react";
import {Admin, Resource, ListGuesser} from 'react-admin';

import {useAuth0, withAuth0, withAuthenticationRequired} from "@auth0/auth0-react";
import repoProvider from "./providers/repositoryProvider";

const App = () => {
    const { getAccessTokenSilently } = useAuth0();
    const dataProvider = repoProvider(getAccessTokenSilently);

    return (
        <Admin dataProvider={dataProvider}>
            <Resource name="bundles" list={ListGuesser}/>
        </Admin>
    );
}

export default withAuthenticationRequired(withAuth0(App));