// auth.js
const { ConfidentialClientApplication } =require ('@azure/msal-node');
const { TENANT_ID, CLIENT_ID, CLIENT_SECRET }=require( './config.js');

 async function getAccessToken() {
    const authority = `https://login.microsoftonline.com/${TENANT_ID}`;
    const app = new ConfidentialClientApplication({
        auth: {
            clientId: CLIENT_ID,
            authority,
            clientSecret: CLIENT_SECRET,
        },
    });
    console.log('line 14 auth.js ' + app)
    const result = await app.acquireTokenByClientCredential({
        scopes: ["https://graph.microsoft.com/.default"],
    });

    if (result && result.accessToken) {
        console.log('access grated')
        return result.accessToken;
    } else {
        console.log('access denied')
        throw new Error('Could not obtain access token');
    }
}

if (process.argv.includes('test-auth')) {
    (async () => {
        console.log(await getAccessToken());
    })();
}
