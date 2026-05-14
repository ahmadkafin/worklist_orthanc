import { configDotenv } from "dotenv";
import fs from "fs";
import path from "path";
import dcmjs from "dcmjs";
import db from "../Models/index.js";

const Modality = db.Modality;
const Parameters = db.Parameters;

configDotenv();

const { DicomMetaDictionary, DicomDict } = dcmjs.data;
const SOPCLASSUID = "1.2.840.10008.5.1.4.31";

export const makeWorklist = async (req, res) => {
    try {
        // const { patientName, patientID, accessionNumber, parameter, modality, aetitle, sex, birthdate } = req.body;
        const { nama, no_rm, no_order, dokter, pemeriksaan } = req.body;

        pemeriksaan.map((e) => {
            const data = dataSet(req.body, e.accessionNumber, DicomMetaDictionary, modality, sopInstanceUID, aetitle);
        });

        // Generate UIDs
        const sopInstanceUID = DicomMetaDictionary.uid();
        const sopClassUID = "1.2.840.10008.5.1.4.31"; // MWL SOP Class

        // Dataset untuk worklist
        const data = dataSet(patientName, patientID, accessionNumber, DicomMetaDictionary);

        // Buat DicomDict dengan meta header yang benar
        const dicomDict = new DicomDict({});

        // Set meta information
        dicomDict.meta = DicomMetaDictionary.denaturalizeDataset({
            FileMetaInformationVersion: new Uint8Array([0, 1]),
            // MediaStorageSOPClassUID: sopClassUID,
            MediaStorageSOPClassUID: SOPCLASSUID,
            MediaStorageSOPInstanceUID: sopInstanceUID,
            TransferSyntaxUID: "1.2.840.10008.1.2.1", // Explicit VR Little Endian
            ImplementationClassUID: "1.2.276.0.7230010.3.0.3.6.6",
            ImplementationVersionName: "DCMJS_WORKLIST",
        });

        // Set dataset
        // dicomDict.dict = DicomMetaDictionary.denaturalizeDataset(dataset);
        dicomDict.dict = DicomMetaDictionary.denaturalizeDataset(data);
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

/**
 * async function
 */
const searchParam = async (pemeriksaan) => {
    const data = Parameters.findOne({
        where: {
            parameter: pemeriksaan
        },
        includes: [
            {
                model: Modality,
            }
        ]
    })
    return data;
}

/**
 * sync function
 */
const dataSet = (data, accessionNumber, DicomMetaDictionary, modality, sopInstanceUID, aetitle) => {
    return {
        SpecificCharacterSet: "ISO_IR 100",
        PatientName: data.nama.trim(),
        PatientID: data.no_rm.trim(),
        AccessionNumber: accessionNumber.trim(),
        PatientBirthDate: data.birthdate, // not done
        PatientSex: data.sex, // not done
        Modality: modality, // not done
        SOPClassUID: SOPCLASSUID, // not done
        SOPInstanceUID: sopInstanceUID, // not done
        ScheduledProcedureStepSequence: [
            {
                ScheduledStationAETitle: aetitle, // not done
                ScheduledProcedureStepDescription: data.parameter, // not done
                ScheduledPerformingPhysicianName: data.dokter, // not done
                ScheduledProcedureStepID: "1".trim(), // not done
                StudyInstanceUID: DicomMetaDictionary.uid(),
                RequestedProcedureID: accessionNumber.trim(),
                Modality: modality, // not done
                ScheduledProcedureStepStartDate: new Date()
                    .toISOString()
                    .split("T")[0]
                    .replace(/-/g, ""),
                ScheduledProcedureStepStartTime: "100000",
            },
        ],
    }
} 