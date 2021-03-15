import * as React from "react";
import {Admin, Resource, ListGuesser} from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import {withAuth0, withAuthenticationRequired} from "@auth0/auth0-react";

const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');

const App = () => (
    <Admin dataProvider={dataProvider}>
        <Resource name="users" list={ListGuesser}/>
    </Admin>
);

export default withAuthenticationRequired(withAuth0(App));