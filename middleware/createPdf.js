const pdf = require("html-pdf-node");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const randomCode = require("../middleware/geretorCode");
const orderModels = require("../models/ordermodel");
const moment = require("moment");
const momentTZ = require("moment-timezone");

async function createPDFS(orderId) {
    const orders = await orderModels
      .findById(orderId)
      .populate({ path: "userId", select: "firstName lastName userImage" }).populate({path:"driverId",select:"firstName lastName"})
      .populate({
        path: "addressId",
        select:
          "locationName streetAddress city state zipCode location phoneNumber",
      });
  
      const hotStartTime = moment.utc(orders.startHotTempDateAndTime).tz('America/New_York').format('hh:mm A');
      const hotEndTime = moment.utc(orders.endHotTempDateAndTime).tz('America/New_York').format('hh:mm A');
      const coldStartTime = moment.utc(orders.startColdTempDateAndTime).tz('America/New_York').format('hh:mm A');
      const coldEndTime = moment.utc(orders.endColdTempDateAndTime).tz('America/New_York').format('hh:mm A')
  
    const html=`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jeffery's Catering - Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        @media print {
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            @page {
                size: a4;
            }

            html {
                -webkit-print-color-adjust: exact;
            }

            body {
                display: flex;
                flex-direction: column;
                min-height: 100vh;

            }

            .invoice_card {
                width: 100%;
                font-family: sans-serif;
                flex: 1;
            }

            .card_up {
                padding: 15px;
                margin-top: 10px;
                border-radius: 15px 15px 0 0;
            }

            .bill_data img {
                width: 170px;
                height: max-content;
            }

            .bill_data {
                display: flex;
                justify-content: space-between;

            }

            .card_header {
                text-align: left;
                width: 170px;
                word-break: break-all;
                margin: 5px 0;
            }


            .card_header_detail {
                font-size: 10px;
                font-weight: 600;
                padding-bottom: 5px;
                margin: 6px;
                display: flex;
                gap: 15px;
                align-items: center;/
            }

            .card_chebox {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 10px;
                font-weight: 600;
                margin: 2px 10px;

            }

            .main_table {
                width: 100%;
                border-collapse: collapse;
                margin: 35px 0;
                outline: 2px solid #b1005d;
                outline-offset: 4px;

            }

            .main_table tr {
                / border-bottom: 1px solid #363636 /
                border: 1px solid #9e9d9d;

            }

            .main_table td {
                padding: 10px;
                text-align: center;
                font-size: 9px;
                max-width: 400px;
                word-break: break-all;
                border: 1px solid #9e9d9d;

            }


            .main_table th {
                padding: 8px;
                text-align: center;
                font-size: 10px;
                border: 1px solid #9e9d9d;
                background-color: #b1005d;
                color: #fff;

            }

            .table_head {
                background-color: #b1005d;
                color: #fff;
                padding: 0 !important;

            }

            .table_green {
                background-color: rgb(14, 82, 14);
                color: #fff;

            }

            .table_des {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-direction: column;
                font-weight: 700;
                padding: 10px;
            }

            .table_des li {
                list-style-type: none;
                padding: 3px;
                font-weight: 100;
            }

            .tdata {
                display: flex;
                justify-content: space-evenly;
                padding: 10px 0;

            }

            .tdata li {
                list-style-type: none;
            }

            .tdata>span {
                width: 30%
            }

            .card_temp {
                display: flex;
                justify-content: space-between;
            }

            .cold_table {
                width: 300px;
                background-color: rgb(231, 242, 255);
                border-radius: 5px;
                border-collapse: collapse;
            }

            .cold_table tr {
                border-bottom: 1px solid #9e9d9d
            }

            .hot_table td,
            .cold_table td {
                padding: 7px;
                text-align: center;
                font-size: 9px;
                max-width: 400px;
                word-break: break-all;
                border: 1px solid white;
                border-collapse: collapse;

            }



            .hot_table th,
            .cold_table th {
                padding: 8px;
                text-align: center;
                font-size: 10px;
                border: 1px solid white;
                border-collapse: collapse;

            }

            .hot_table {
                width: 250px;
                border-collapse: collapse;
                background-color: rgb(255, 237, 237);
                border-radius: 10px;
            }

            .card_temp_hot {
                font-size: 11px;
                font-weight: 600;
                margin: 10px;
                background-color: rgb(199, 66, 66);
                color: white;
                border-radius: 5px 5px 0 0;

            }

            .card_temp_cold {
                font-size: 11px;
                font-weight: 600;
                margin: 10px;
                background-color: rgb(66, 118, 173);
                color: white;
                border-radius: 5px 5px 0 0;
            }

            .card_temp_hot>span,
            .card_temp_cold>span {
                color: black;
                font-size: 10px;

            }

            .card_textbox {
                border-radius: 10px;
                word-break: break-all;
                width: 55%
            }

            .bill_footer_div {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }

            .card_footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 250px;
            }

            .card_footer_data {
                font-size: 11px;
                color: #000;
                text-align: left;
                font-weight: 700 !important;

            }

            .card_footer_data>p {
                margin: 10px 0;
            }

            .card_footer_data>img {
                width: 110px;

            }

            .data_pink {
                background-color: #f4cee2;
            }

            .data_green {
                background-color: rgb(177, 215, 177);
            }
        }

        .invoice_card {
            width: 100%;
            font-family: sans-serif;
            flex: 1;
        }

        .card_up {
            padding: 15px;
            margin-top: 10px;
            border-radius: 15px 15px 0 0;
        }

        .bill_data img {
            width: 170px;
            height: max-content;
        }

        .bill_data {
            display: flex;
            justify-content: space-between;

        }

        .card_header {
            text-align: left;
            width: 170px;
            word-break: break-all;
            margin: 5px 0;
        }


        .card_header_detail {
            font-size: 10px;
            font-weight: bold;
            padding-bottom: 5px;
            margin: 6px;
            display: flex;
            gap: 15px;
            align-items: center;
        }

        .card_chebox {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            font-weight: 600;
            margin: 2px 10px;

        }

        .main_table {
            width: 100%;
            border-collapse: collapse;
            margin: 35px 0;
            outline: 2px solid #b1005d;
            outline-offset: 4px;

        }

        .main_table tr {
            / border-bottom: 1px solid #363636 /
            border: 1px solid #9e9d9d;

        }

        .main_table td {
            padding: 10px;
            text-align: center;
            font-size: 9px;
            max-width: 400px;
            word-break: break-all;
            border: 1px solid #9e9d9d;

        }


        .main_table th {
            padding: 8px;
            text-align: center;
            font-size: 10px;
            border: 1px solid #9e9d9d;
            background-color: #b1005d;
            color: #fff;

        }

        .table_head {
            background-color: #b1005d;
            color: #fff;
            padding: 0 !important;

        }

        .table_green {
            background-color: rgb(14, 82, 14);
            color: #fff;

        }

        .table_des {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-direction: column;
            font-weight: 700;
            padding: 10px;
        }

        .table_des li {
            list-style-type: none;
            padding: 3px;
            font-weight: 100;
        }

        .tdata {
            display: flex;
            justify-content: space-evenly;
            padding: 10px 0;

        }

        .tdata li {
            list-style-type: none;
        }

        .tdata>span {
            width: 30%
        }

        .card_temp {
            display: flex;
            justify-content: space-between;
        }

        .cold_table {
            width: 300px;
            background-color: rgb(231, 242, 255);
            border-radius: 5px;
            border-collapse: collapse;
        }

        .cold_table tr {
            border-bottom: 1px solid #9e9d9d
        }

        .hot_table td,
        .cold_table td {
            padding: 7px;
            text-align: center;
            font-size: 9px;
            max-width: 400px;
            word-break: break-all;
            border: 1px solid white;
            border-collapse: collapse;

        }



        .hot_table th,
        .cold_table th {
            padding: 8px;
            text-align: center;
            font-size: 10px;
            border: 1px solid white;
            border-collapse: collapse;

        }

        .hot_table {
            width: 250px;
            border-collapse: collapse;
            background-color: rgb(255, 237, 237);
            border-radius: 10px;
        }

        .card_temp_hot {
            font-size: 11px;
            font-weight: 600;
            margin: 10px;
            background-color: rgb(199, 66, 66);
            color: white;
            border-radius: 5px 5px 0 0;

        }

        .card_temp_cold {
            font-size: 11px;
            font-weight: 600;
            margin: 10px;
            background-color: rgb(66, 118, 173);
            color: white;
            border-radius: 5px 5px 0 0;
        }

        .card_temp_hot>span,
        .card_temp_cold>span {
            color: black;
            font-size: 10px;

        }

        .card_textbox {
            border-radius: 10px;
            word-break: break-all;
            width: 55%
        }

        .bill_footer_div {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .card_footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 250px;
        }

        .card_footer_data {
            font-size: 11px;
            color: #000;
            text-align: left;
            font-weight: 700;
        }

        .card_footer_data>p {
            margin: 10px 0;

            span {
                font-weight: 300;
            }
        }

        .card_footer_data>img {
            width: 110px;

        }

        .data_pink {
            background-color: #f4cee2;
        }

        .data_green {
            background-color: rgb(177, 215, 177);
        }

        .bill_instruct {
            display: flex;

        }

        .driver_name {
            margin-bottom: 20px;
        }
    </style>
    </head>
    <body>
         <div class="invoice_card">
            <div class="card_up">
                <div class="bill_data">
                    <div>
                        <img src="http://52.7.244.188:3000/assets/images/LoginLogo.png" alt="">
                        <p class="card_header_detail">4415 Wheeler Avenue, Alexandria, VA 22304</p>
                        <p class="card_header_detail">(703) 751-1286 </p>
                    </div>
    
                    <div class="card_header">
                        <p class="card_header_detail">Order Code: ${orders.orderCode ?? ''} </p>
                        <p class="card_header_detail">Order Created: ${moment.utc(orders.created_at ?? '').tz("America/New_York").format("MM-DD-YYYY")}</p>
                        <p class="card_header_detail">Delivery Date: ${moment(orders.orderDate ?? '').format("MM-DD-YYYY")}</p>
                        <p class="card_header_detail">Customer : ${orders.userId.firstName ?? ''} ${orders.userId.lastName ?? ''}</p>
                        <p class="card_header_detail">Address: ${orders.addressId.locationName ?? ''} : ${orders.addressId.streetAddress ?? ''}, ${orders.addressId.zipCode ?? ''}, ${orders.addressId.phoneNumber ?? ''}</p>
                        <p class="card_header_detail">Phone: ${orders.addressId.phoneNumber ?? ''}</p>
                    </div>
                </div>
    
                <table class="main_table">
                    <tr>
                        <th rowspan="2">Meal</th>
                        <th rowspan="2">Qty</th>
                        <th rowspan="2">Items</th>
                        <th colspan="2">Exit (carterer)</th>
                        <th colspan="2">Receiving (classroom)</th>
                        <th colspan="2" style="background-color:rgb(14, 82, 14);">Serving (classroom)</th>
                    </tr>
                    <tr>
                        <td class="table_head">Time</td>
                        <td class="table_head">Temp</td>
                        <td class="table_head">Time</td>
                        <td class="table_head">Temp</td>
                        <td class="table_green">Time</td>
                        <td class="table_green">Temp</td>
                    </tr>
                    ${orders.orderItems.map(orderItem => `
                        ${orderItem.orderItem.map(item => `
                            <tr>
                                <td>${orderItem.orderType || ''}</td>
                                <td>${orderItem.quantity || ''}</td>
                                <td>${item.items || ''}</td>
                                <td>${item.startTempDateAndTime ? moment(item.startTempDateAndTime).tz('America/New_York').format('hh:mm A') : ''}</td>
                                <td>${item.startTempValue || ''}</td>
                                <td>${item.endTempDateAndTime ? moment(item.endTempDateAndTime).tz('America/New_York').format('hh:mm A') : ''}</td>
                                <td>${item.endTempValue || ''}</td>
                                <td></td>
                                <td></td>
                            </tr>
                        `).join('')}
                    `).join('')}
                    <tr style="background-color: #b1005d;color: #efefef;">
                        <td colspan="9"></td>
                    </tr>
                </table>
            </div>
           <div class="bill_footer_div">
            <div>
                <p class="card_header_detail">Special Instructions : ${
                    orders.description ?? ''
                    }</p>

                <p class="card_header_detail">Were all regular menu items delivered? :
                    <span class="card_chebox">
                        <input type="checkbox" id="yes" ${ orders.were_all_regular_menu_items_delivered ? "checked" : ""
                            }>
                        <label for="yes">Yes</label>
                    </span>
                    <span class="card_chebox">
                        <input type="checkbox" id="yes" ${ orders.were_all_regular_menu_items_delivered ? "" : "checked"
                            }>
                        <label for="no">No</label>
                    </span>

                </p>
                <p class="card_header_detail">Were all modified and vegetarian items delivered? :
                    <span class="card_chebox">
                        <input type="checkbox" id="yes" ${ orders.were_all_modified_and_vegetarian_items_delivered
                            ? "checked" : "" }>
                        <label for="yes"> Yes</label>
                    </span>
                    <span class="card_chebox">
                        <input type="checkbox" id="yes" ${ orders.were_all_modified_and_vegetarian_items_delivered ? ""
                            : "checked" }>
                        <label for="no">No</label>
                    </span>
                </p>
                <p class="card_header_detail">If no, which items were missing? <span
                        class="card_textbox">${orders.missingItems ?? ''}</span>
                </p>
                <p class="card_header_detail">
                    Comment :
                    <span class="card_textbox">${orders.clientComments ?? ''}</span>
                </p>


            </div>
            <div class="card_footer">

                <div class="card_footer_data">
                    <p class="driver_name">Delivery Driver : <span>${orders.driverId.firstName ?? ''} ${orders.driverId.lastName ?? ''}</span></p>

                    <p style=" font-style: italic;">Customer's Delivery Acknowledgement</p>
                    <p>Name: <span>${orders.receiveCustomerFirstName ?? ''} ${
                            orders.receiveCustomerLastName ?? ''
                            }</span> </p>
                    <p>Signature:</p>
                    <img src="${orders.customerSignature ?? ''}" alt="" />
                </div>
            </div>

        </div>

    </div>

    </div>
    </div>

</body>

</html>
    `
      const options = { format: "A4", orientation: "portrait" };
    const file = { content: html };
    const pdfBuffer = await pdf.generatePdf(file, options);
  
    const params = {
      Bucket: "jefferys-s3",
      Key: `invoice_${randomCode.onlyNumber(4)}.pdf`,
      Body: pdfBuffer,
      ACL: "public-read",
      ContentType: "application/pdf",
      ContentDisposition: "inline",
    };
    try {
      const result = await s3.upload(params).promise();
      console.log("File uploaded successfully", result.Location);
      return result.Location;
    } catch (err) {
      console.log("Error occurred while uploading", err);
      throw err;
    }
  }

module.exports = createPDFS;
