// src/controllers/converterController.ts
import Papa from 'papaparse';
import { Request, Response } from 'express';
import * as converterService from '../services/converterService';

/**
 * Convert a CSV file to JSON format.
 * @param {Request} req - The HTTP request object containing the CSV file.
 * @param {Response} res - The HTTP response object.
 */
async function getConvertedCsv(req: Request, res: Response): Promise<void> {
  try {
    // Ensure the file is defined and of the correct type
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
      return;
    }

    const file = req.file;
    const buffer = file.buffer;

    // Convert buffer to string to parse CSV
    const csvString = buffer.toString('utf-8');

    // Use PapaParse to read CSV data from the string
    Papa.parse(csvString, {
      header: true,
      complete: async (result: Papa.ParseResult<unknown[]>) => {
        // Use a service to convert parsed data to JSON if necessary
        const jsonData = result.data.length > 0 ? await converterService.convertToJSON(result.data) : [];
        res.json({ success: true, data: jsonData });
      },
      error: (error: Papa.ParseError) => {
        console.error("🚀 ~ Papa.parse ~ error:", error);
        res.status(500).json({ success: false, message: "Server error" });
      },
    } as Papa.ParseConfig<unknown[]>);

  } catch (error) {
    console.error("🚀 ~ getConvertedCsv ~ error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export { getConvertedCsv };