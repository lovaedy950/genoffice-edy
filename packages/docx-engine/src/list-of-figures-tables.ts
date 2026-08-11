import type { Block, ParsedDoc, Run } from './types'

export interface FigureItem {
  id: string
  bookmarkName: string
  caption: string
  blockIndex: number
}

export interface TableItem {
  id: string
  bookmarkName: string
  caption: string
  blockIndex: number
}

export interface DocumentMediaScan {
  figures: FigureItem[]
  tables: TableItem[]
}

/**
 * Scan a ParsedDoc for images/drawings and tables, generating unique bookmark anchors
 * and extracting caption texts for List of Figures & List of Tables generation.
 */
export function scanFiguresAndTables(doc: ParsedDoc): DocumentMediaScan {
  const figures: FigureItem[] = []
  const tables: TableItem[] = []

  let figCount = 0
  let tblCount = 0

  doc.blocks.forEach((block, index) => {
    if (block.type === 'image' || (block.type === 'passthrough' && block.label === 'Image')) {
      figCount++
      const bookmarkName = `_Ref_Fig_${figCount}`
      const captionText = block.previewText || `Gambar ${figCount}`
      figures.push({
        id: `fig-${figCount}`,
        bookmarkName,
        caption: captionText,
        blockIndex: index,
      })

      // Ensure target block carries bookmark anchor
      if (block.type === 'image' || block.type === 'paragraph') {
        const firstRun = block.runs?.[0]
        if (firstRun) {
          firstRun.bookmarkStart = { id: String(1000 + figCount), name: bookmarkName }
          firstRun.bookmarkEnd = { id: String(1000 + figCount) }
        }
      }
    } else if (block.type === 'table') {
      tblCount++
      const bookmarkName = `_Ref_Tbl_${tblCount}`
      const captionText = `Tabel ${tblCount}`
      tables.push({
        id: `tbl-${tblCount}`,
        bookmarkName,
        caption: captionText,
        blockIndex: index,
      })
    }
  })

  return { figures, tables }
}

/**
 * Generate paragraph blocks for a List of Figures (Daftar Gambar)
 * with internal hyperlink runs pointing to figure bookmark anchors.
 */
export function generateListOfFiguresBlocks(figures: FigureItem[]): Block[] {
  const titleBlock: Block = {
    id: 'lof-title',
    docxIndex: -1,
    type: 'heading',
    level: 2,
    runs: [
      {
        text: 'Daftar Gambar',
        bold: true,
        sizeHalfPoints: 28,
      },
    ],
  }

  if (figures.length === 0) {
    const emptyBlock: Block = {
      id: 'lof-empty',
      docxIndex: -1,
      type: 'paragraph',
      runs: [{ text: '(Tidak ada gambar ditemukan dalam dokumen)', italic: true }],
    }
    return [titleBlock, emptyBlock]
  }

  const entryBlocks: Block[] = figures.map((fig, idx) => {
    const label = `Gambar ${idx + 1}: ${fig.caption}`
    const linkRun: Run = {
      text: label,
      color: '005A9C',
      underline: true,
      link: {
        anchor: fig.bookmarkName,
        href: `#${fig.bookmarkName}`,
      },
    }

    return {
      id: `lof-entry-${idx + 1}`,
      docxIndex: -1,
      type: 'paragraph',
      format: {
        tabStops: [{ pos: 9350, val: 'right', leader: 'dot' }],
      },
      runs: [linkRun],
    }
  })

  return [titleBlock, ...entryBlocks]
}

/**
 * Generate paragraph blocks for a List of Tables (Daftar Tabel)
 * with internal hyperlink runs pointing to table bookmark anchors.
 */
export function generateListOfTablesBlocks(tables: TableItem[]): Block[] {
  const titleBlock: Block = {
    id: 'lot-title',
    docxIndex: -1,
    type: 'heading',
    level: 2,
    runs: [
      {
        text: 'Daftar Tabel',
        bold: true,
        sizeHalfPoints: 28,
      },
    ],
  }

  if (tables.length === 0) {
    const emptyBlock: Block = {
      id: 'lot-empty',
      docxIndex: -1,
      type: 'paragraph',
      runs: [{ text: '(Tidak ada tabel ditemukan dalam dokumen)', italic: true }],
    }
    return [titleBlock, emptyBlock]
  }

  const entryBlocks: Block[] = tables.map((tbl, idx) => {
    const label = `Tabel ${idx + 1}: ${tbl.caption}`
    const linkRun: Run = {
      text: label,
      color: '005A9C',
      underline: true,
      link: {
        anchor: tbl.bookmarkName,
        href: `#${tbl.bookmarkName}`,
      },
    }

    return {
      id: `lot-entry-${idx + 1}`,
      docxIndex: -1,
      type: 'paragraph',
      format: {
        tabStops: [{ pos: 9350, val: 'right', leader: 'dot' }],
      },
      runs: [linkRun],
    }
  })

  return [titleBlock, ...entryBlocks]
}
