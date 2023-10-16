import {JWT} from "google-auth-library";
import {GoogleSpreadsheet} from "google-spreadsheet";
import {getP2PData} from "./bybit-api.js";
import dotenv from "dotenv";

dotenv.config()

const serviceAccountAuth = new JWT({
    email: process.env.SERVICE_EMAIL,
    key: process.env.PRIVATE_KEY,
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);
await doc.loadInfo();
let sheet = doc.sheetsByTitle["p2p"];
if (!sheet) {
    sheet = await doc.addSheet({headerValues: ['Bank', 'Min Price', 'Max Price', "Average Price"], title: "p2p"});
}

const rows = await sheet.getRows();
const data = {"581": "Tinkoff", "582": "Sberbank", "583": "Alfa Bank"};
let i = 0;
for (let bank in data) {
    const p2pData = await getP2PData(bank);
    if (p2pData) {
        if(rows.length <= i){
            await sheet.addRow([data[bank], p2pData.minPrice, p2pData.maxPrice, p2pData.avgPrice]);
        }else{
            rows[i].set('Bank', data[bank]);
            rows[i].set('Min Price', p2pData.minPrice);
            rows[i].set('Max Price', p2pData.maxPrice);
            rows[i].set('Average Price', p2pData.avgPrice);
            await rows[i].save();
        }
        i++;
    }
}


