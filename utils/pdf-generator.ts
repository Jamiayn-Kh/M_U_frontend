import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { MoldOrder } from '@/types'

export function generateOrderPDF(order: MoldOrder) {
  const doc = new jsPDF()
  
  // Group items by prefix
  const aItems = order.items.filter(i => i.codePrefix === 'A')
  const sItems = order.items.filter(i => i.codePrefix === 'S')
  const kItems = order.items.filter(i => i.codePrefix === 'K')
  
  const asItems = [...aItems, ...sItems].sort((a, b) => a.moldCode.localeCompare(b.moldCode))
  
  // Page 1: A and S codes
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`Order #${order.id}`, 14, 15)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Seller: ${order.seller.fullName}`, 14, 25)
  if (order.cityHandler) {
    doc.text(`Handler: ${order.cityHandler.fullName}`, 14, 31)
  }
  doc.text(`Date: ${new Date(order.receivedAt || order.createdAt).toLocaleDateString()}`, 14, 37)
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Page 1: A & S Code Molds', 14, 48)
  
  if (asItems.length > 0) {
    autoTable(doc, {
      startY: 53,
      head: [['#', 'Mold Code', 'Prefix', 'Quantity', 'Stone Required']],
      body: asItems.map((item, idx) => [
        idx + 1,
        item.moldCode,
        item.codePrefix,
        item.quantity,
        item.stoneRequired ? 'Yes' : 'No'
      ]),
      foot: [[
        { content: 'Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: asItems.reduce((sum, i) => sum + i.quantity, 0).toString(), styles: { fontStyle: 'bold' } },
        ''
      ]],
      theme: 'grid',
      styles: { 
        font: 'helvetica', 
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      footStyles: { 
        fillColor: [236, 240, 241],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 40, halign: 'left' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 40, halign: 'center' }
      }
    })
  } else {
    doc.setFont('helvetica', 'italic')
    doc.text('No A or S code molds in this order', 14, 60)
  }
  
  // Page 2: K codes
  if (kItems.length > 0) {
    doc.addPage()
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`Order #${order.id}`, 14, 15)
    
    doc.setFontSize(12)
    doc.text('Page 2: K Code Molds', 14, 25)
    
    const sortedKItems = kItems.sort((a, b) => a.moldCode.localeCompare(b.moldCode))
    
    autoTable(doc, {
      startY: 30,
      head: [['#', 'Mold Code', 'Prefix', 'Quantity', 'Stone Required']],
      body: sortedKItems.map((item, idx) => [
        idx + 1,
        item.moldCode,
        item.codePrefix,
        item.quantity,
        item.stoneRequired ? 'Yes' : 'No'
      ]),
      foot: [[
        { content: 'Total', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: sortedKItems.reduce((sum, i) => sum + i.quantity, 0).toString(), styles: { fontStyle: 'bold' } },
        ''
      ]],
      theme: 'grid',
      styles: { 
        font: 'helvetica', 
        fontSize: 10,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      footStyles: { 
        fillColor: [236, 240, 241],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 40, halign: 'left' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 30, halign: 'center' },
        4: { cellWidth: 40, halign: 'center' }
      }
    })
  }
  
  // Add summary footer on last page
  const finalY = (doc as any).lastAutoTable.finalY || 100
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total molds: ${order.items.length} types`, 14, finalY + 15)
  doc.text(`Total pieces: ${order.items.reduce((sum, i) => sum + i.quantity, 0)}`, 14, finalY + 21)
  doc.text(`With stone: ${order.items.filter(i => i.stoneRequired).length} types`, 14, finalY + 27)
  
  // Save the PDF
  const filename = `order-${order.id}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
