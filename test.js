const axios = require('axios');
const fs = require('fs');
const iso6391 = require('iso-639-1');



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