module.exports = invoicePDF =>{
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Jeffery's Catering - Invoice</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
    
        p {
          color: #666;
          line-height: 1.6;
        }
    
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4caf50;
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Jeffery's Catering</h1>
        <p>Hello ${invoicePDF.userName},</p>
        <p>Thank you for ordering from our company. Your invoice is attached.</p>
        <p>Best regards,<br>Jeffery's Catering</p>
        
        <!-- Download button for the PDF -->
        <a class="button" href="${invoicePDF.pdfLink}" download="Invoice.pdf">Download Invoice</a>
      </div>
    </body>
    </html>
    `
}