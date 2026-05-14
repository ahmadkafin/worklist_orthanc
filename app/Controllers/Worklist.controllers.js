import { configDotenv } from "dotenv";
import fs from "fs";
import path from "path";
import dcmjs from "dcmjs";
import db from "../Models/index.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Modality = db.Modality;
const Parameters = db.Parameters;

configDotenv();

const { DicomMetaDictionary, DicomDict } = dcmjs.data;
const SOPCLASSUID = "1.2.840.10008.5.1.4.31";

export const makeWorklist = async (req, res) => {
    try {
        // const { patientName, patientID, accessionNumber, parameter, modality, aetitle, sex, birthdate } = req.body;
        const { nama, no_rm, no_order, dokter, pemeriksaan } = req.body;
        const WORKLIST_DIR = process.env.WORKLISTDIR || path.join(__dirname, "../../worklists");

        if (!fs.existsSync(WORKLIST_DIR)) {
            fs.mkdirSync(WORKLIST_DIR, { recursive: true, mode: 0o755 });
        }

        for (const p of pemeriksaan) {
            // get data modalitas
            const paramData = await searchParam(p.parameter);
            if (!paramData) continue;

            // Generate UID & dataset
            const sopInstanceUID = DicomMetaDictionary.uid();
            const dataset = dataSet(req.body, e.accessionNumber, DicomMetaDictionary, modality, sopInstanceUID);

            // Generate DICOM
            const dicomDict = new DicomDict({});
            dicomDict.meta = DicomMetaDictionary.denaturalizeDataset({
                FileMetaInformationVersion: new Uint8Array([0, 1]),
                // MediaStorageSOPClassUID: sopClassUID,
                MediaStorageSOPClassUID: SOPCLASSUID,
                MediaStorageSOPInstanceUID: sopInstanceUID,
                TransferSyntaxUID: "1.2.840.10008.1.2.1", // Explicit VR Little Endian
                ImplementationClassUID: "1.2.276.0.7230010.3.0.3.6.6",
                ImplementationVersionName: "DCMJS_WORKLIST",
            });

            dicomDict.dict = DicomMetaDictionary.denaturalizeDataset(dataset);

            // write file buffer
            const buffer = Buffer.from(dicomDict.write());
            const fileName = `${no_rm}-${p.accessionNumber}`;
            fs.writeFileSync(path.join(WORKLIST_DIR, fileName), buffer, { mode: 0o644 });
        }
        res.status(200).json({ status: "success", message: "Worklist generated successfully" });
    } catch (e) {
        console.error("Error generating worklist:", e);
        res
            .status(500)
            .json({ message: "Error generating DICOM file", error: e.message });
    }
};

/**
 * async function
 */
const searchParam = async (pemeriksaan) => {
    return Parameters.findOne({
        where: {
            parameter: pemeriksaan
        },
        include: [
            {
                model: Modality,
            }
        ]
    })
}

/**
 * sync function
 */
const dataSet = (data, accessionNumber, DicomMetaDictionary, paramData, sopInstanceUID) => {
    const mainStudyUID = generateShortUID();
    return {
        SpecificCharacterSet: "ISO_IR 100",
        PatientName: data.nama.trim(),
        PatientID: data.no_rm.trim(),
        AccessionNumber: accessionNumber.trim(),
        PatientBirthDate: data.birthdate || "",
        PatientSex: data.sex || "O",
        Modality: paramData.Modality?.modality || "OT",
        SOPClassUID: SOPCLASSUID,
        SOPInstanceUID: mainStudyUID,
        ScheduledProcedureStepSequence: [
            {
                ScheduledStationAETitle: paramData.Modality?.aetitle || "",
                ScheduledProcedureStepDescription: paramData.parameter,
                ScheduledPerformingPhysicianName: data.dokter,
                ScheduledProcedureStepID: "1",
                StudyInstanceUID: mainStudyUID,
                RequestedProcedureID: accessionNumber.trim(),
                Modality: paramData.Modality?.modality || "OT",
                ScheduledProcedureStepStartDate: new Date()
                    .toISOString()
                    .split("T")[0]
                    .replace(/-/g, ""),
                ScheduledProcedureStepStartTime: "100000",
            },
        ],
    }
}

const generateShortUID = () => {
    const root = "2.25.";
    const randomPart = Array.from({ length: 4 }, () => Math.floor(Math.random() * 1000000000)).join('.');
    return (root + randomPart).substring(0, 64);
}