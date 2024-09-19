// src/controllers/converterController.ts
import Papa from 'papaparse'
import { Request, Response } from 'express'
import { convertToJSON, TradeModel } from '@services/converterService'
import { handleControllerError } from '@utils/errorUtil'

/**
 * Convert a CSV file to JSON format.
 */
async function getConvertedCsv(req: Request, res: Response): Promise<void> {
  try {
    // Ensure the file is defined and of the correct type
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }

    const file = req.file
    const buffer = file.buffer

    // Convert buffer to string to parse CSV
    const csvString = buffer.toString('utf-8')

    // Use PapaParse to read CSV data from the string
    Papa.parse(csvString, {
      header: true,
      complete: async (result: Papa.ParseResult<object>) => {
        // Use a service to convert parsed data to JSON if necessary
        const data =
          result.data.length > 0
            ? await convertToJSON(result.data as TradeModel[])
            : []
        res.status(200).json({ message: 'CSV converted to JSON', data })
      },
      error: (error: Papa.ParseError) => {
        handleControllerError(res, error, 'papaParse')
      }
    } as Papa.ParseConfig<unknown[]>)
  } catch (error) {
    handleControllerError(res, error, 'getConvertedCsv')
  }
}

export { getConvertedCsv }