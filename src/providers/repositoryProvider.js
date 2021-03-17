import {fetchUtils} from 'react-admin';
import {stringify} from 'query-string';

const apiUrl = 'https://repo.opalpolicy.com/v1';

class RepositoryProvider {

    constructor(tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    httpClient(url, options = {}) {
        return new Promise((resolve, reject) => {
            this.tokenProvider()
                .then(token => {
                    options.user = {
                        authenticated: true,
                        token: 'Bearer ' + token
                    };

                    return resolve(fetchUtils.fetchJson(url, options));

                }).catch(e => reject(e));
        });
    }

    getList(resource, params) {
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return this.httpClient(url).then(({headers, json}) => {
            console.log(`getList received data: ${JSON.stringify(json)}`);
            const data = json.map(({name, ...rest}) => ({...rest, id: name}))
            const result = {
                data,
                total: data.length //parseInt(headers.get('content-range').split('/').pop(), 10),
            };
            console.log(`getList result: ${JSON.stringify(result)}`);
            return result;
        });
    }

    getOne(resource, params) {
        return this.httpClient(`${apiUrl}/${resource}/${params.id}`).then(({headers, body}) => ({
            data: {id: params.id, payload: body, size: headers.get('Content-Length')},
        }));
    }

    getMany(resource, params) {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        return this.httpClient(url).then(({json}) => ({data: json}));
    }

    getManyReference(resource, params) {
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify({
                ...params.filter,
                [params.target]: params.id,
            }),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;

        return this.httpClient(url).then(({headers, json}) => ({
            data: json,
            total: parseInt(headers.get('content-range').split('/').pop(), 10),
        }));
    }

    update(resource, params) {
        return this.httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json}))
    }

    updateMany(resource, params) {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        return this.httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json}));
    }

    create(resource, params) {
        return this.httpClient(`${apiUrl}/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({
            data: {...params.data, id: json.id},
        }))
    }

    delete(resource, params) {
        return this.httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({json}) => ({data: json}))
    }

    deleteMany(resource, params) {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        return this.httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
            method: 'DELETE',
        }).then(({json}) => ({data: json}));
    }
}

const provider = (tokenProvider) => new RepositoryProvider(tokenProvider);

export default provider;