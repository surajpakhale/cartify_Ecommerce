const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateInvoicePDF(order, userDetails) {
    return new Promise((resolve, reject) => {
        try {
            // Create a PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            // Generate unique filename
            const invoiceDir = path.join(__dirname, '../../invoices');
            if (!fs.existsSync(invoiceDir)) {
                fs.mkdirSync(invoiceDir, { recursive: true });
            }
            
            const fileName = `invoice_${order._id}_${Date.now()}.pdf`;
            const filePath = path.join(invoiceDir, fileName);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(24).font('Helvetica-Bold').text('📦 INVOICE', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text('Cartify E-Commerce', { align: 'center' });
            doc.fontSize(9).fillColor('#666666').text('Your trusted online store', { align: 'center' });
            doc.moveDown(1);

            // Invoice details
            doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold').text('Invoice Details:', { underline: true });
            doc.fontSize(9).font('Helvetica').fillColor('#333333');
            doc.text(`Order ID: ${order._id.toString().slice(0, 8).toUpperCase()}`);
            doc.text(`Invoice Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`);
            doc.text(`Invoice Time: ${new Date(order.createdAt || Date.now()).toLocaleTimeString('en-IN')}`);
            doc.text(`Payment Status: ${order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}`);
            doc.moveDown(1);

            // Customer details
            doc.fontSize(10).font('Helvetica-Bold').text('Delivery Address:', { underline: true });
            doc.fontSize(9).font('Helvetica').fillColor('#333333');
            doc.text(`Name: ${order.address?.fullname || userDetails?.name || 'N/A'}`);
            doc.text(`Address: ${order.address?.street || 'N/A'}`);
            doc.text(`City: ${order.address?.city || 'N/A'}`);
            doc.text(`Postal Code: ${order.address?.postalCode || 'N/A'}`);
            doc.text(`Country: ${order.address?.country || 'N/A'}`);
            doc.moveDown(1);

            // Order items table header
            const startX = 50;
            const startY = doc.y;
            const columnWidth = 100;
            const rowHeight = 25;

            doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
            doc.text('Product', startX, startY);
            doc.text('Qty', startX + columnWidth, startY);
            doc.text('Price', startX + columnWidth * 2, startY);
            doc.text('Total', startX + columnWidth * 3, startY);

            // Horizontal line
            doc.moveTo(startX, startY + 20)
                .lineTo(startX + columnWidth * 4, startY + 20)
                .stroke();

            // Order items
            doc.fontSize(9).font('Helvetica').fillColor('#333333');
            let itemY = startY + 30;

            (order.items || []).forEach((item, index) => {
                const productName = item.product?.name || item.productName || 'Product';
                const quantity = item.quantity || 0;
                const price = item.price || 0;
                const total = quantity * price;

                doc.text(productName.substring(0, 20), startX, itemY);
                doc.text(quantity.toString(), startX + columnWidth, itemY);
                doc.text(`₹${price.toFixed(2)}`, startX + columnWidth * 2, itemY);
                doc.text(`₹${total.toFixed(2)}`, startX + columnWidth * 3, itemY);

                itemY += rowHeight;
            });

            // Horizontal line before totals
            doc.moveTo(startX, itemY)
                .lineTo(startX + columnWidth * 4, itemY)
                .stroke();

            itemY += 10;

            // Totals section
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000');
            doc.text('Total Amount:', startX + columnWidth * 2, itemY);
            doc.text(`₹${(order.totalAmount || 0).toFixed(2)}`, startX + columnWidth * 3, itemY);

            doc.moveDown(2);

            // Footer
            doc.fontSize(8).fillColor('#666666').font('Helvetica').text(
                '------- Thank you for your purchase! -------',
                { align: 'center' }
            );
            doc.text('For any queries, please contact us at support@cartify.com', { align: 'center' });
            doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

            // Finalize PDF
            doc.end();

            // Handle stream events
            stream.on('finish', () => {
                console.log('✅ PDF Invoice created:', fileName);
                resolve({
                    success: true,
                    fileName: fileName,
                    filePath: filePath
                });
            });

            stream.on('error', (err) => {
                console.log('❌ PDF Stream error:', err.message);
                reject(err);
            });

            doc.on('error', (err) => {
                console.log('❌ PDF Document error:', err.message);
                reject(err);
            });

        } catch (error) {
            console.log('❌ PDF Generation error:', error.message);
            reject(error);
        }
    });
}

module.exports = generateInvoicePDF;
