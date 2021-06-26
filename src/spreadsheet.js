import {google} from 'googleapis';
import {GoogleAuth} from 'google-auth-library';
import Axios from 'axios';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SHEET_ID = '1KbyRcGUIBg-QxLXPuMHUaDtIZn1Uxju-zscQ-Olh3Qg';

const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Recipes!A2:E1000`

const getSpreadsheet = async () => {
    const auth = new GoogleAuth({
        scopes: SCOPES
    });
    const client = await auth.getClient();
    const {token} = await client.getAccessToken()

    const {data: {values}} = await Axios.get(URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    return values;
}

export {
    getSpreadsheet
}
