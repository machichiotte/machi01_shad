// src/ctrl/converterController.ts
import Papa from 'papaparse'
import { Request, Response } from 'express'
import { convertToJSON, TradeModel } from '@services/serviceConverter'
import { handleControllerError } from '@utils/errorUtil'

async function convertCsvFileToJson(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        status: "error",
        message: 'No file uploaded'
      })
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
        res.status(200).json({ status: "success", message: 'CSV converted to JSON', data })
      },
      error: (error: Papa.ParseError) => {
        handleControllerError(res, error, 'papaParse')
      }
    } as Papa.ParseConfig<unknown[]>)
  } catch (error) {
    handleControllerError(res, error, convertCsvFileToJson.name)
  }
}

export { convertCsvFileToJson }