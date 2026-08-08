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
  
  // Check if any item has stone required
  const hasStoneInAS = asItems.some(i => i.stoneRequired)
  const hasStoneInK = kItems.some(i => i.stoneRequired)
  
  // Page 1: A and S codes
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`Order #${order.id}`, 14, 15)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date: ${new Date(order.receivedAt || order.createdAt).toLocaleDateString()}`, 14, 22)
  
  if (asItems.length > 0) {
    // Prepare headers based on stone requirement
    const headers = hasStoneInAS 
      ? [['#', 'Mold Code', 'Quantity', 'Stone Required']]
      : [['#', 'Mold Code', 'Quantity']]
    
    // Prepare body based on stone requirement
    const body = asItems.map((item, idx) => {
      const row: any[] = [
        idx + 1,
        item.moldCode,
        item.quantity
      ]
      if (hasStoneInAS) {
        row.push(item.stoneRequired ? 'yes' : '')
      }
      return row
    })
    
    // Prepare footer
    const footerCols = hasStoneInAS ? 4 : 3
    const footer = [[
      { content: 'Total', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: asItems.reduce((sum, i) => sum + i.quantity, 0).toString(), styles: { fontStyle: 'bold' } },
      ...(hasStoneInAS ? [''] : [])
    ]]
    
    autoTable(doc, {
      startY: 28,
      head: headers,
      body: body,
      foot: footer,
      theme: 'grid',
      styles: { 
        font: 'helvetica', 
        fontSize: 10,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      footStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: hasStoneInAS ? {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' }
      } : {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 30, halign: 'center' }
      }
    })
  }
  
  // Page 2: K codes
  if (kItems.length > 0) {
    doc.addPage()
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Order #${order.id}`, 14, 15)
    
    const sortedKItems = kItems.sort((a, b) => a.moldCode.localeCompare(b.moldCode))
    
    // Prepare headers based on stone requirement
    const headers = hasStoneInK 
      ? [['#', 'Mold Code', 'Quantity', 'Stone Required']]
      : [['#', 'Mold Code', 'Quantity']]
    
    // Prepare body based on stone requirement
    const body = sortedKItems.map((item, idx) => {
      const row: any[] = [
        idx + 1,
        item.moldCode,
        item.quantity
      ]
      if (hasStoneInK) {
        row.push(item.stoneRequired ? 'yes' : '')
      }
      return row
    })
    
    // Prepare footer
    const footer = [[
      { content: 'Total', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: sortedKItems.reduce((sum, i) => sum + i.quantity, 0).toString(), styles: { fontStyle: 'bold' } },
      ...(hasStoneInK ? [''] : [])
    ]]
    
    autoTable(doc, {
      startY: 20,
      head: headers,
      body: body,
      foot: footer,
      theme: 'grid',
      styles: { 
        font: 'helvetica', 
        fontSize: 10,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center'
      },
      footStyles: { 
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: hasStoneInK ? {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 40, halign: 'center' }
      } : {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 30, halign: 'center' }
      }
    })
  }
  
  // Add summary footer on last page
  const finalY = (doc as any).lastAutoTable.finalY || 100
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total molds: ${order.items.length} types`, 14, finalY + 10)
  doc.text(`Total pieces: ${order.items.reduce((sum, i) => sum + i.quantity, 0)}`, 14, finalY + 16)
  
  const stoneCount = order.items.filter(i => i.stoneRequired).length
  if (stoneCount > 0) {
    doc.text(`With stone: ${stoneCount} types`, 14, finalY + 22)
  }
  
  // Save the PDF
  const filename = `order-${order.id}-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
