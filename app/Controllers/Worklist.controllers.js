import { configDotenv } from "dotenv";
import fs from "fs";
import path from "path";
import dcmjs from "dcmjs";

configDotenv();

const { DicomMetaDictionary, DicomDict } = dcmjs.data;

export const makeWorklist = (req, res) => {
    try {
        const { patientName, patientID, accessionNumber, parameter } = req.body;

        // Generate UIDs
        const sopInstanceUID = DicomMetaDictionary.uid();
        const sopClassUID = "1.2.840.10008.5.1.4.31"; // MWL SOP Class

        // Dataset untuk worklist
        const dataset = {
            SpecificCharacterSet: "ISO_IR 100",
            PatientName: patientName,
            PatientID: patientID,
            AccessionNumber: accessionNumber,
            Modality: "DX",
            SOPClassUID: sopClassUID,
            SOPInstanceUID: sopInstanceUID,
            ScheduledProcedureStepSequence: [
                {
                    ScheduledStationAETitle: "DRXR004277",
                    ScheduledProcedureStepDescription: parameter,
                    ScheduledPerformingPhysicianName: "TEST^DOC",
                    ScheduledProcedureStepID: "1",
                    StudyInstanceUID: DicomMetaDictionary.uid(),
                    RequestedProcedureID: accessionNumber,
                    Modality: "DX",
                    ScheduledProcedureStepStartDate: new Date()
                        .toISOString()
                        .split("T")[0]
                        .replace(/-/g, ""),
                    ScheduledProcedureStepStartTime: "100000",
                },
            ],
        };

        // Buat DicomDict dengan meta header yang benar
        const dicomDict = new DicomDict({});

        // Set meta information
        dicomDict.meta = DicomMetaDictionary.denaturalizeDataset({
            FileMetaInformationVersion: new Uint8Array([0, 1]),
            MediaStorageSOPClassUID: sopClassUID,
            MediaStorageSOPInstanceUID: sopInstanceUID,
            TransferSyntaxUID: "1.2.840.10008.1.2.1", // Explicit VR Little Endian
            ImplementationClassUID: "1.2.276.0.7230010.3.0.3.6.6",
            ImplementationVersionName: "DCMJS_WORKLIST",
        });

        // Set dataset
        dicomDict.dict = DicomMetaDictionary.denaturalizeDataset(dataset);

        const buffer = Buffer.from(dicomDict.write());
        const fileName = `${accessionNumber}.wl`;
        const WORKLIST_DIR =
            process.env.WORKLISTDIR || path.join(__dirname, "../../worklists");

        // Pastikan direktori ada
        if (!fs.existsSync(WORKLIST_DIR)) {
            fs.mkdirSync(WORKLIST_DIR, { recursive: true, mode: 0o755 });
        }

        fs.writeFileSync(path.join(WORKLIST_DIR, fileName), buffer, { mode: 0o644 });
        res
            .status(200)
            .json({ status: "success", message: "Worklist generated successfully" });
    } catch (e) {
        console.error("Error generating worklist:", e);
        res
            .status(500)
            .json({ message: "Error generating DICOM file", error: e.message });
    }
};
