const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadImage(input) {
    const { url, name, folder } = input;
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        const filePath = path.join(folder, name);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log(`Đã lưu ảnh tại: ${filePath}`);
        });

        writer.on('error', (err) => {
            console.error('Lỗi ghi file:', err);
        });
    } catch (err) {
        console.log(err);
    }
}

async function downloadDicom(input) {
    const { url, name, folder } = input;
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                Accept: 'application/zip'
            }
        });

        const filePath = path.join(folder, name);
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', () => {
            console.log(`File đã được lưu tại: ${filePath}`);
        });

        writer.on('error', (err) => {
            console.error('Lỗi ghi file:', err);
        });
    } catch (error) {
        console.error('Lỗi tải file:', error.message);
    }
}

async function saveResponse(input) {
    const { url, token, name, folder } = input;
    try {
        const response = await axios({
            url,
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            }
        });
        const filePath = path.join(folder, name);
        fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2));
        console.log('Đã call api thành công');
    } catch (err) {
        console.error('Call api err:', err.message);
    }
}

const input = JSON.parse(fs.readFileSync('./input.json', { encoding: 'utf-8' }));
if (!input) return;

const folderName = input.studyId.toString();
if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
}

const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJlZjIyN2I1Ni0wOTRlLTRiMWUtOGZjZC1mZTdhYjAwODJkN2QiLCJpc3MiOiJodHRwczovL3ZpbmJyYWluLmIyY2xvZ2luLmNvbS80MWQ1YTM1MS0yMTQ1LTQxNTEtOGNhNi1mZmRlMjI5ZmIzMzAvdjIuMC8iLCJleHAiOjE3NDkyNzc5MzQsIm5iZiI6MTc0OTE5MTUzNCwib2lkIjoiYjM4NmQ1ZTItODI1Yi00NTc1LTg0YjYtMGY5MDYwMDUwOGJhIiwic3ViIjoiYjM4NmQ1ZTItODI1Yi00NTc1LTg0YjYtMGY5MDYwMDUwOGJhIiwibmFtZSI6IkFkbWluIFBLX0RLXzVTQU9fSE4iLCJnaXZlbl9uYW1lIjoiUEtfREtfNVNBT19ITiIsImVtYWlscyI6WyJQS19ES181U0FPX0hOQGRyYWlkYWRtLmRyYWlkLmFpIl0sInRmcCI6IkIyQ18xX3ZibWRhLXNpZ25pbi12Mi1wcm9kIiwibm9uY2UiOiI2M2MzYzk2Yy1iODM3LTQyODYtODNiMi1mMmNhYjdmZDY1ZmIiLCJzY3AiOiJ2Ym1kYS5yZWFkIiwiYXpwIjoiZWYyMjdiNTYtMDk0ZS00YjFlLThmY2QtZmU3YWIwMDgyZDdkIiwidmVyIjoiMS4wIiwiaWF0IjoxNzQ5MTkxNTM0fQ.IVy_Jo-Kehk-XJDDZrSNY30-PCTBwtaFk4A3vfo-02BN-z5VApcX-yfzs5Z_MjWotUt3DAPdvuf0p3YNqfLpXKTTWYqoF1rgkfQv68FbZsLgvEum-8NhzqOR-11o9IUgRhZ_ErDXI_T0XChU0aDgxyFxkcPPeWS5zL33TmDYbScX43g8T3-9iWgy4zhSaReYt9LmlwSeAzpjPKBinZfiT8pPDwJSnkZBu1cBdFKywCZIGZRgCtXCxeXmxwq7yVTIZ-IidhtLwUbvGebEL9yXTH8KYHnBcqKGNp7w3_8rFnr8Tq6s_d1gwSAeSIBvZNE7uSer-SwyRdoWzlVTKiSlvQ';
const apiUrl = `https://api.draid.ai/medical-image/v3/patients/studies?pid=&patientId=${input.patientId}`;
const dicomUrl = `https://api.draid.ai/dcm4chee-archiver-service/dcm4chee-arc/aets/PK_DK_5SAO_HN/rs/studies/${input.studyInstanceUID}?accept=application/zip`;

downloadDicom({
    url: dicomUrl,
    name: `dicom_${input.studyId}.zip`,
    folder: folderName,
});

saveResponse({
    url: apiUrl,
    token,
    name: `${input.patientId}.json`,
    folder: folderName,
})

for (const item of input.series) {
    downloadImage({
        url: item.imageUrl,
        name: item.seriesId.toString() + '.png',
        folder: folderName,
    })
}







