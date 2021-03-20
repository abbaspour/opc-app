import * as React from "react";
import {Admin, Resource, ListGuesser, EditGuesser} from 'react-admin';

import {useAuth0, withAuth0, withAuthenticationRequired} from "@auth0/auth0-react";
import repoProvider from "./providers/repositoryProvider";
import {DataProvider} from "ra-core";

import history from "./utils/history";

const App = () => {
  const { getAccessTokenSilently } = useAuth0();
  const dataProvider = repoProvider(getAccessTokenSilently) as DataProvider;

  return (
      <Admin dataProvider={dataProvider} history={history}>
        <Resource name="bundles" list={ListGuesser} edit={EditGuesser}/>
        <Resource name="policies" list={ListGuesser} edit={EditGuesser}/>
        <Resource name="instances" list={ListGuesser} edit={EditGuesser}/>
      </Admin>
  );
}

export default withAuthenticationRequired(withAuth0(App));