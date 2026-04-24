import { configDotenv } from "dotenv";
import fs, { access } from "fs";
import path from "path";
import dcmjs from 'dcmjs';
configDotenv();

export const makeWorklist = (req, res) => {
    try {
        const { patientName, patientID, accessionNumber, parameter } = req.body;
        const dataset = {
            PatientName: patientName,
            PatientID: patientID,
            AccessionNumber: accessionNumber,
            Modality: "CR",
            ScheduledProcedureStepSequence: [
                {
                    ScheduledStationAETitle: "DRXR004277",
                    ScheduledProcedureStepDescription: parameter,
                    Modality: "CR",
                    ScheduledProcedureStepStartDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
                    ScheduledProcedureStepStartTime: '080000'
                }
            ]
        }
        const denaturalized = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset);
        const dicomDict = new dcmjs.data.DicomDict({
            FileMetaInformationVersion: new Uint8Array([0, 1]).buffer,
            MediaStorageSOPClassUID: "1.2.840.10008.5.1.4.31",
            MediaStorageSOPInstanceUID: dcmjs.data.DicomMetaDictionary.uid(),
            TransferSyntaxUID: "1.2.840.10008.1.2.1",
            ImplementationClassUID: dcmjs.data.DicomMetaDictionary.uid(),
        });

        dicomDict.dict = denaturalized;

        const buffer = Buffer.from(dicomDict.write());
        const fileName = `${accessionNumber}.wl`;
        const WORKLIST_DIR = process.env.WORKLISTDIR || path.join(__dirname, '../../worklists');
        // const WORKLIST_DIR = process.env.WORKLIST_PATH;

        fs.writeFileSync(path.join(WORKLIST_DIR, fileName), buffer);
        res.status(200).json({ status: 'success', message: 'Worklist generated successfully' });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error generating DICOM file" });
    }
}