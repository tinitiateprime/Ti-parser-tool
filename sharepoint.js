// sharepoint.js
const { getAccessToken } =reequire('./auth.js');
const{ SITE_URL } =require('./config.js');
const  { spfi, SPFx, SPFetchClient } =require('@pnp/sp');

let sp;

export async function configureSP() {
    const accessToken = await getAccessToken();
    
    sp = spfi(SITE_URL).using(SPFetchClient, {
        accessToken
    });
}

export async function getFolderByServerRelativeUrl(libraryName) {
    if (!sp) {
        await configureSP();
    }

    return sp.web.getFolderByServerRelativeUrl(libraryName);
}
