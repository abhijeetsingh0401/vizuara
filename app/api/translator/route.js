import { google } from 'googleapis';
import axios from 'axios';

export async function POST(request) {
    try {
        const body = await request.json();
        const { originalText, targetLanguage } = body;
        console.log(originalText, targetLanguage)
        //const languageCode = iso6391.getCode(targetLanguage);
        const token = process.env.GOOGLE_ACCESS_TOKEN;
        console.log("TOKEN:", token)
        const translatedText = await translateText(originalText, targetLanguage, token);
        if (translatedText) {
            return new Response(JSON.stringify(translatedText), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Failed to translate text' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

// async function getAccessToken() {
//     //const { google } = require('googleapis');
//     const auth = new google.auth.GoogleAuth({
//         credentials: {
//             client_email: process.env.GOOGLE_CLIENT_EMAIL,
//             private_key: process.env.GOOGLE_PRIVATE_KEY
//         },
//         scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/cloud-translation', 'https://www.googleapis.com/auth/cloud-platform']
//     });

//     const authClient = await auth.getClient();
//     const accessToken = await authClient.getAccessToken();
//     console.log("ACCESS TOKEN:", accessToken.token);
//     return accessToken.token;
// }

async function translateText(text, targetLanguage, accessToken) {

    const endpoint = `https://translation.googleapis.com/v3beta1/projects/${process.env.GOOGLE_PROJECT_ID}/locations/global:translateText`;

    try {
        const response = await axios.post(
            endpoint,
            {
                "contents": [
                    text
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

        return response.data.translations[0].translatedText;
    } catch (error) {
        console.error('Error translating text:', error);
        throw error;
    }
}