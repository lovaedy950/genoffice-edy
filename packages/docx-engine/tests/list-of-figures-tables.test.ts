import { describe, expect, it } from 'vitest'
import {
  generateListOfFiguresBlocks,
  generateListOfTablesBlocks,
  scanFiguresAndTables,
  type ParsedDoc,
} from '../src'

describe('List of Figures & List of Tables Auto-Generation', () => {
  it('scans figures and tables from a parsed document', () => {
    const mockDoc: ParsedDoc = {
      styles: new Map(),
      blocks: [
        {
          id: 'b1',
          docxIndex: 0,
          type: 'paragraph',
          runs: [{ text: 'Document Title' }],
        },
        {
          id: 'b2',
          docxIndex: 1,
          type: 'image',
          previewText: 'System Diagram',
          runs: [{ text: '' }],
        },
        {
          id: 'b3',
          docxIndex: 2,
          type: 'table',
          table: {
            rows: [
              {
                cells: [
                  { paras: [{ runs: [{ text: 'Header 1' }] }] },
                  { paras: [{ runs: [{ text: 'Header 2' }] }] },
                ],
              },
            ],
          },
        },
      ],
    }

    const result = scanFiguresAndTables(mockDoc)
    expect(result.figures).toHaveLength(1)
    expect(result.figures[0].bookmarkName).toBe('_Ref_Fig_1')
    expect(result.figures[0].caption).toBe('System Diagram')

    expect(result.tables).toHaveLength(1)
    expect(result.tables[0].bookmarkName).toBe('_Ref_Tbl_1')
  })

  it('generates hyperlinked List of Figures blocks', () => {
    const figures = [
      {
        id: 'fig-1',
        bookmarkName: '_Ref_Fig_1',
        caption: 'Flowchart System Architecture',
        blockIndex: 1,
      },
    ]

    const blocks = generateListOfFiguresBlocks(figures)
    expect(blocks).toHaveLength(2)
    expect(blocks[0].runs[0].text).toBe('Daftar Gambar')
    expect(blocks[1].runs[0].text).toBe('Gambar 1: Flowchart System Architecture')
    expect(blocks[1].runs[0].link?.anchor).toBe('_Ref_Fig_1')
    expect(blocks[1].runs[0].link?.href).toBe('#_Ref_Fig_1')
  })

  it('generates hyperlinked List of Tables blocks', () => {
    const tables = [
      {
        id: 'tbl-1',
        bookmarkName: '_Ref_Tbl_1',
        caption: 'Hasil Pengujian Performance',
        blockIndex: 2,
      },
    ]

    const blocks = generateListOfTablesBlocks(tables)
    expect(blocks).toHaveLength(2)
    expect(blocks[0].runs[0].text).toBe('Daftar Tabel')
    expect(blocks[1].runs[0].text).toBe('Tabel 1: Hasil Pengujian Performance')
    expect(blocks[1].runs[0].link?.anchor).toBe('_Ref_Tbl_1')
    expect(blocks[1].runs[0].link?.href).toBe('#_Ref_Tbl_1')
  })
})
