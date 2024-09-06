const readXlsxFile = require('read-excel-file/node')

// router.post('/addcoach', upload_image.single('fileupload'), async function (req, res, next) {
//     try {
//         subadmin_id = req.user.id
//         if (req.file) {
//             console.log(req.file, 'req.file.......................')
//             const fileupload = req.file.path;
//             console.log(fileupload, 'file....................................')
//             const defaultImage = "/upload_image/default.png";

//             // Use read-excel-file to read the uploaded Excel file
//             const excelData = await readXlsxFile(fileupload);
//             console.log(excelData, "DATA>>>>>>>>>>>>>>>>>>>>>>>");

//             // Check if excelData has at least two rows (header and data)
//             if (excelData.length >= 2) {
//                 const headerRow = excelData[0]; // Get the header row
//                 excelData.shift(); // Remove the header row from the data

//                 for (const row of excelData) {
//                     try {
//                         // Create a new coach entry in the database using Sequelize's Coach model
//                         await Coach.create({
//                             name: row[0], // Assuming the name is in the first column
//                             email: row[1],
//                             phonenumber: row[2],
//                             subadmin_id: subadmin_id,
//                             image: defaultImage,

//                             // Add other fields here as needed
//                         });
//                     } catch (error) {
//                         console.error('Error inserting coach:', error);
//                         // Handle any errors that occur during database insertion
//                     }
//                 }
//                 res.redirect('/coach')
//             } else {
//                 res.status(400).send('No data rows found in the Excel file');
//             }
//         } else {
//             res.status(400).send('No file uploaded');
//         }
//     } catch (error) {
//         console.error('Error reading Excel file:', error);
//         res.status(500).send('Error reading Excel file');
//     }
// });