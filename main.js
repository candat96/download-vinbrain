// SELECT study.* , bn."first_name", bn.pid, bn."date_of_birth", bn.gender FROM "study" as study
// LEFT JOIN patient as bn on bn.patient_id = study.patient_id;
const _ = require("lodash");
const db = require('./db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const moment = require("moment");

const getDataExport = async (page , limit = 20) => {
    const sql = `
        SELECT study.* , bn."first_name", bn.pid, bn."date_of_birth", bn.gender FROM "study" as study
        LEFT JOIN patient as bn on bn.patient_id = study.patient_id
        where study.captured_date between '2024-01-01' and '2025-12-31'
        ORDER BY study.captured_date desc
        LIMIT ${limit} OFFSET ${ page = 1 ? 0 :page * limit}
    ;
    `
    const result = await db.query(sql);
    return result.rows;
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

// Hàm làm sạch tên thư mục để tránh lỗi
function sanitizeFolderName(name) {
    if (!name) return '';
    
    // Chuyển đổi thành chuỗi
    name = String(name);
    
    // Loại bỏ các ký tự không hợp lệ trong tên thư mục Windows
    return name.replace(/[\\/:*?"<>|]/g, '_');
}

// Hàm định dạng ngày sinh sang múi giờ +7 định dạng YYYYMMDD
function formatBirthDate(birthDate) {
    if (!birthDate) return 'unknown_date';
    
    try {
        // Chuyển đổi sang múi giờ +7 và định dạng YYYYMMDD
        return moment(birthDate).utcOffset('+07:00').format('YYYYMMDD');
    } catch (error) {
        console.error('Lỗi khi định dạng ngày sinh:', error);
        return 'invalid_date';
    }
}

// Hàm chuyển đổi captured_date sang múi giờ +7 với định dạng YYYYMMDDHHmmss
function formatCapturedDate(capturedDate) {
    if (!capturedDate) return 'unknown_datetime';
    
    try {
        // Chuyển đổi từ định dạng ISO (như 2025-06-07T01:19:21.000Z) sang múi giờ +7
        return moment(capturedDate).utcOffset('+07:00').format('YYYYMMDDHHmmss');
    } catch (error) {
        console.error('Lỗi khi định dạng thời gian chụp:', error);
        return 'invalid_datetime';
    }
}

// Hàm chuyển đổi giới tính từ tiếng Anh sang tiếng Việt
function translateGender(gender) {
    if (!gender) return 'KHONGXACDINH';
    
    // Chuyển đổi về chữ hoa và loại bỏ khoảng trắng
    const normalizedGender = String(gender).trim().toUpperCase();
    
    // Chuyển đổi giới tính
    switch (normalizedGender) {
        case 'MALE':
        case 'M':
            return 'NAM';
        case 'FEMALE':
        case 'F':
            return 'NU';
        default:
            return normalizedGender; // Giữ nguyên nếu không khớp
    }
}

const main = async () => {
    const rawData = await getDataExport(1);
    const groupDataByPatient = _.groupBy(rawData, 'patient_id');

    let data = []
    for (const patientId of Object.keys(groupDataByPatient)) {
        const patientData = groupDataByPatient[patientId];
        const dataPatientWithStudy = { 
            patientId: patientId,
            patientName: patientData[0].first_name,
            patientBirth: patientData[0].date_of_birth,
            patientGender: patientData[0].gender,
            study: patientData.map(item => {
                const { first_name, date_of_birth, gender, ...rest } = item;
                return rest

            })
        }
        data.push(dataPatientWithStudy)
    }
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2)); 

    // Đảm bảo thư mục download tồn tại
    const downloadDir = path.join('.', 'download');
    if (!fs.existsSync(downloadDir)) {
        try {
            fs.mkdirSync(downloadDir, { recursive: true });
        } catch (err) {
            console.error('Lỗi khi tạo thư mục download:', err);
            return; // Dừng nếu không thể tạo thư mục gốc
        }
    }

    // Mảng lưu trữ các lỗi xảy ra trong quá trình xử lý
    const errors = [];

    for (const item of data) {
        try {
            // Làm sạch các thành phần của tên thư mục
            const safePatientId = sanitizeFolderName(item.patientId);
            const safePatientName = sanitizeFolderName(item.patientName);
            // Chuyển đổi ngày sinh sang định dạng YYYYMMDD múi giờ +7
            const safePatientBirth = formatBirthDate(item.patientBirth);
            // Chuyển đổi giới tính sang tiếng Việt (NAM/NU)
            const safePatientGender = translateGender(item.patientGender);
            
            // Tạo tên thư mục an toàn
            const folderName = path.join(downloadDir, `${safePatientId}-${safePatientName}-${safePatientBirth}-${safePatientGender}`);
            
            console.log(`Đang tạo thư mục: ${folderName}`);
            
            if (!fs.existsSync(folderName)) {
                fs.mkdirSync(folderName, { recursive: true });
                console.log(`Đã tạo thư mục: ${folderName}`);
            }
            
            for (const study of item.study) {
                const dicomUrl = `https://api.draid.ai/dcm4chee-archiver-service/dcm4chee-arc/aets/PK_DK_ISHII_SG/rs/studies/${study.study_instance_uid}?accept=application/zip`;
                
                // Chuyển đổi captured_date sang múi giờ +7
                const formattedDate = formatCapturedDate(study.captured_date);
                
                await downloadDicom({
                    url: dicomUrl,
                    name: `dicom_${study.study_id}_${formattedDate}.zip`,
                    folder: folderName,
                });
            }
        } catch (err) {
            console.error(`Lỗi khi xử lý bệnh nhân ${item.patientId}:`, err);
            
            // Thêm thông tin lỗi vào mảng errors
            errors.push({
                patientId: item.patientId,
                patientName: item.patientName,
                patientBirth: item.patientBirth,
                patientGender: item.patientGender,
                error: {
                    message: err.message,
                    stack: err.stack,
                    timestamp: new Date().toISOString()
                }
            });
        }
    }
    
    // Ghi lỗi vào file nếu có
    if (errors.length > 0) {
        const errorLogFile = path.join('.', 'error_log.json');
        fs.writeFileSync(errorLogFile, JSON.stringify(errors, null, 2));
        console.log(`Đã ghi ${errors.length} lỗi vào file: ${errorLogFile}`);
    } else {
        console.log('Không có lỗi nào xảy ra trong quá trình xử lý.');
    }
}

main();
