import {fetchUtils} from 'react-admin';
import {stringify} from 'query-string';
import {DataProvider} from 'react-admin';
import {
    DeleteManyParams, DeleteManyResult,
    DeleteParams,
    GetListParams,
    GetListResult,
    GetManyParams,
    GetManyReferenceParams, GetManyReferenceResult,
    GetManyResult,
    GetOneResult,
    Record, UpdateManyParams, UpdateManyResult, UpdateParams, UpdateResult,
    CreateParams, CreateResult, DeleteResult, GetOneParams
} from "ra-core";
import {Options} from "ra-core/lib/dataProvider/fetch";

const apiUrl = 'https://api.opalpolicy.com';

type TokenProvider = () => Promise<string>;

interface Bundle extends Record {
    id: string,
    size: number,
    etag: string,
    lastModified: string
}

interface Policy extends Record {
    id: string,
    size: number,
    etag: string,
    lastModified: string
}

interface RepositoryRecord extends Bundle, Policy {
}

interface RepositoryProviderInterface extends DataProvider {
}

class RepositoryProvider implements RepositoryProviderInterface {

    constructor(readonly tokenProvider: TokenProvider) {
    }


    type(resource: string) : string {
        switch (resource) {
            case 'bundles':
            case 'policies':
                return 'repository';
            case 'instances':
                return 'runtime';
            default:
                return 'unknown';
        }
    }


    httpClient(url: string, options?: Options): Promise<{
        status: number;
        headers: Headers;
        body: string;
        json: any;
    }> {
        return new Promise((resolve, reject) => {
            this.tokenProvider()
                .then(token => {
                    if (!options) options = {};
                    options.user = {
                        authenticated: true,
                        token: 'Bearer ' + token
                    };

                    return resolve(fetchUtils.fetchJson(url, options));

                }).catch(e => reject(e));
        });
    }

    getList<RepositoryRecord>(resource: string, params: GetListParams): Promise<GetListResult<RepositoryRecord>> {
        const {page, perPage} = params.pagination;
        const {field, order} = params.sort;
        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${this.type(resource)}/v1/${resource}?${stringify(query)}`;

        return this.httpClient(url).then(({/*headers,*/ json}) => {
            console.log(`getList received data: ${JSON.stringify(json)}`);
            // @ts-ignore
            const data = json.map(({name, ...rest}) => ({...rest, id: name}))
            const result = {
                data,
                total: data.length //parseInt(headers.get('content-range').split('/').pop(), 10),
            };
            console.log(`getList result: ${JSON.stringify(result)}`);
            return result;
        });
    }

    getOne<RepositoryRecord>(resource: string, params: GetOneParams): Promise<GetOneResult<RepositoryRecord>> {
        return this.httpClient(`${apiUrl}/${this.type(resource)}/v1/${resource}/${params.id}`)
            .then(({headers, body}) => ({
                // @ts-ignore
                data: {
                    id: params.id, /*payload: body,*/
                    size: headers.get('Content-Length'),
                    etag: 'N/A',
                    lastModified: 'N/A'
                } as RepositoryRecord,
            }));
    }

    getMany<RepositoryRecord>(resource: string, params: GetManyParams): Promise<GetManyResult<RepositoryRecord>> {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        const url = `${apiUrl}/${this.type(resource)}/v1/${resource}?${stringify(query)}`;
        return this.httpClient(url).then(({json}) => ({data: json}));
    }

    getManyReference<RepositoryRecord>(resource: string, params: GetManyReferenceParams): Promise<GetManyReferenceResult<RepositoryRecord>> {
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
        const url = `${apiUrl}/${this.type(resource)}/v1/${resource}?${stringify(query)}`;

        return this.httpClient(url).then(({headers, json}) => ({
            data: json,
            total: json.length // parseInt(headers.get('content-range').split('/').pop(), 10),
        }));
    }

    update<RepositoryRecord>(resource: string, params: UpdateParams): Promise<UpdateResult<RepositoryRecord>> {
        return this.httpClient(`${apiUrl}/${this.type(resource)}/v1/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json}))
    }

    updateMany(resource: string, params: UpdateManyParams): Promise<UpdateManyResult> {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        return this.httpClient(`${apiUrl}/${this.type(resource)}/v1/${resource}?${stringify(query)}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({data: json}));
    }

    create<RepositoryRecord>(resource: string, params: CreateParams): Promise<CreateResult<RepositoryRecord>> {
        return this.httpClient(`${apiUrl}/${this.type(resource)}/v1/${resource}`, {
            method: 'POST',
            body: JSON.stringify(params.data),
        }).then(({json}) => ({
            data: {...params.data, id: json.id},
        }))
    }

    delete<RepositoryRecord>(resource: string, params: DeleteParams): Promise<DeleteResult<RepositoryRecord>> {
        return this.httpClient(`${apiUrl}/${this.type(resource)}/v1/${resource}/${params.id}`, {
            method: 'DELETE',
        }).then(({json}) => ({data: json}))
    }

    deleteMany(resource: string, params: DeleteManyParams): Promise<DeleteManyResult> {
        const query = {
            filter: JSON.stringify({id: params.ids}),
        };
        return this.httpClient(`${apiUrl}/${this.type(resource)}/v1/${resource}?${stringify(query)}`, {
            method: 'DELETE',
        }).then(({json}) => ({data: json}));
    }
}

const provider = (tokenProvider: TokenProvider) => new RepositoryProvider(tokenProvider);

export default provider;