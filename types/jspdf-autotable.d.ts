declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface AutoTableOptions {
    startY?: number
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    theme?: 'striped' | 'grid' | 'plain'
    styles?: {
      font?: string
      fontSize?: number
      cellPadding?: number
      lineColor?: number | number[]
      lineWidth?: number
    }
    headStyles?: {
      fillColor?: number | number[]
      textColor?: number | number[]
      fontStyle?: string
      halign?: 'left' | 'center' | 'right'
    }
    footStyles?: {
      fillColor?: number | number[]
      textColor?: number | number[]
      fontStyle?: string
      halign?: 'left' | 'center' | 'right'
    }
    columnStyles?: {
      [key: number]: {
        cellWidth?: number | 'auto' | 'wrap'
        halign?: 'left' | 'center' | 'right'
      }
    }
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void

  export default autoTable
}

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number
    }
  }
}
