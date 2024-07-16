const axios = require('axios');
const fs = require('fs');
const iso6391 = require('iso-639-1');

const key = {
    "type": "service_account",
    "project_id": "foss-mentoring",
    "private_key_id": "d0000796815497a2e26b3362aed32e5cab07a061",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCg3ogPrK4yojAH\nBNpYLpwe/85uTW3XQX3zHBD/ZlVL/5rrybjfIiqhKv3ElB40jsHqvuulyg987XgK\n/8NEnEgUMtiAjsZNcaz9uuvDNNBRQo1FZQbDW2ALL292iNbmEHifz8cK/ZiXPk5j\nNJHMKxt3XclmXJZTZzv3z2NrJJBJNTA4MJ9MXTP1sGbSNRhEHJbts+a7Ri3yBMxw\nmrMfY6jt6P3uYCwjiN2aTpjNQDxANd/7k77iHSDvT4g9uMWy7GEX/XScx27plXJY\nqIrbv7A28WonCN+l537P3CIyDwScNDMNCx8QrVRPgJeZOf6TZkc7ehbszpj/cCuX\nJ3323IDhAgMBAAECggEABM1XyCLNiWpN69IeHXgSUrRfdzhdZGNXWeo9nkFYOWS0\nltmZwlY5nQy7Cg/DQUQXFev9ZCCekT1g5VbCTFPfX/QuzwZtqExE9hPXuI1+f92w\nRc3KY6SgfsnIXN3tW+1Kch5u9xnf+l9sOIObEmC7P2pmJtjYZ1fdBalkDGovp3Im\n2koLtwCJuUTOAaYbYIawQSUKqu5stoI9AgeannOlbWudYaaIhSPA81dTPuW7h6mG\nbe3xSl/MW46vRgMxrbRqzlFRz6pb/XdqglO34VNshdVWPi4Nse1yXzCgZA35BjbZ\n0U1TeEKRfNeofOEem8t2if8Z4+WeGhMe+ZbBR6c5xQKBgQDM8ETn3Of7EcfBVe2P\nu6q3b6eKM15iS54jeyyBpH44vxg/fClAwf9mfHqaNfGEINf7sGYXcpeu0BP/chFr\ndcrqur+6m29RlLK03fbNELpSHN4pyrom9l/G7FJKfLY3/KecUX8A+X0ACSYdOoTF\nk3n4jJgAEL3I5LiX4AkR/Cx+fQKBgQDI81yjXMPHOKxsWMUZazxZU/csm8HeH1uH\nTNqOJRrontlGhxw8OIYLcUB+06/xDVWLVKZBOnlHT86qK7MeHFNgPrjgu+jLcfKw\nKmQXLMoYuJlvJwetLesd1yWH7ZE9gFLbh5yH0vFDc662ajIyvIKDMBXFyBOPoEkJ\nWNH0I+tlNQKBgQDJKTrpwMuwhVZnLvo9sL80yZNRs3R81a7HMxuPsa/38ZNSlYRE\nvWf96EfL4RFNWZPHyPGdKG09OZ+3iPcSXRAt8dtKx1GwaV407P9ZcIcDHLTxnr20\niveeYc+wr9OJByZa6R/aDAqno1NXM16qNUVvNEnrHoO7ks6ivVUJ41alXQKBgQCD\n1DOn8El3vtRO2AWl4VXb/FuhZiVPBR9UqbSPoAQBK4S64hRB5Yr6ord+/HzmFKtU\nFppjHGtHvzGDLdv6GvcPotZCiMP2A7EEpSq4kWebxC7UXrSIhiFCmExE2jN4N2Ek\nJ9kmudoROCkb/psj8ctlKPx/nfxHMw33Fc/W7GGXKQKBgHY8SXAyivjzUl2YJgVF\nOKBw7FV/whYxxM/VaXxDw569ng7dxjusfmU5wAvcwjWkEsp14TLEOFRlyEL3Kgna\nozNoyUe/y6gpFgrVJcArY+LM9+VgbJgbnctu8FfDGRTtFV/3ayFwofDRRrPi7yRf\nYXkPqLbmNwWjv9Cayf/LYNg/\n-----END PRIVATE KEY-----\n",
    "client_email": "foss-mentoring@appspot.gserviceaccount.com",
    "client_id": "113589626941692217002",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/foss-mentoring%40appspot.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

const serviceEndpoint = `https://translation.googleapis.com/v3beta1/projects/${key.project_id}/supportedLanguages`;

// async function getSupportedLanguages() {
//     try {
//         const response = await axios.get(serviceEndpoint, {
//             headers: {
//                 'Authorization': `Bearer ${await getAccessToken()}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         if (response.data && response.data.languages) {
//             const languages = response.data.languages.map(lang => ({
//                 languageCode: lang.languageCode,
//                 displayName: iso6391(lang.languageCode),
//                 supportSource: lang.supportSource,
//                 supportTarget: lang.supportTarget
//             }));
//             console.log("Languages:", languages)

//             // Write to a JSON file
//             fs.writeFileSync('supported_languages.json', JSON.stringify(languages, null, 2));
//             console.log('Supported languages have been written to supported_languages.json');

//             return response.data.languages;
//         } else {
//             console.error('Error fetching supported languages:', response.data);
//             return null;
//         }
//     } catch (error) {
//         console.error('Error in getSupportedLanguages function:', error);
//         return null;
//     }
// }

// // Example usage:
// getSupportedLanguages().then(languages => {
//     if (languages) {
//         //console.log('Supported Languages:', languages);
//     }
// });

// function getLanguageDisplayName(languageCode) {
//     let displayName = iso6391.getName(languageCode);

//     if (!displayName) {
//         // If iso-639-1 does not have the language, use the bcp-47-match library
//         const parsed = parse(languageCode);
//         if (parsed && parsed.language) {
//             displayName = match(languageCode).join(' ');
//         } else {
//             displayName = languageCode; // Fallback to the language code itself
//         }
//     }

//     return displayName;
// }

const text = "Checking if this can be converted to Gujrati and other regional languages.";

async function getAccessToken() {
    const { google } = require('googleapis');
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: key.client_email,
            private_key: key.private_key
        },
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const authClient = await auth.getClient();
    const accessToken = await authClient.getAccessToken();
    console.log("ACCESS TOKEN:", accessToken.token);
    return accessToken.token;
}

async function translateText(text, targetLanguage, accessToken) {
    const endpoint = `https://translate.googleapis.com/v3beta1/{parent=${key.project_id}/*}:translateText`;
//POST https://translate.googleapis.com/v3beta1/{parent=projects/*}:translateText


    try {
        const response = await axios.post(
            endpoint,
            {
                "contents": [
                    "string"
                ], 
                mimeType: 'text/plain',
                targetLanguageCode: targetLanguage,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const translatedText = response.data.data.translations[0].translatedText;
        return translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        throw error;
    }
}
async function main() {
    const accessToken = await getAccessToken();
    const targetLanguages = ['gu', 'hi', 'bn', 'ta']; // Gujarati, Hindi, Bengali, Tamil

    for (const targetLanguage of targetLanguages) {
        const translatedText = await translateText(text, 'gu', accessToken);
        console.log(`Translated to ${targetLanguage}: ${translatedText}`);
    }
}

main().catch(console.error);