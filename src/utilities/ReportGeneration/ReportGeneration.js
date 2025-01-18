import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Button } from 'antd';

function ReportGeneration({fileData}) {
    /*

    How to pass fileData:
    ----------------------------------------------------------------------------------------------------------------------
    - Must contain a "name" key for information (as an object) required to name the file, which must contain:
        - A "mrn" key for the patient's MRN (as a string)
        - A "fullName" key for the patient's full name (as a string)
        - A "treatmentId" key for the treatment ID for which this report is being generated (as a string)
    - Must contain a "title" key for the title (as a string) of the report
    - Must contain a "sections" key for an array of objects denoting each section, whereby each section must contain:
        - A "title" key for the title (as a string) of that section
        - A "fields" key for an array of objects denoting each field, whereby each field must contain:
            - A "name" key for the name (as a string) of the field
            - A "content" key for the actual content (as a string) for that respective field
            - A "inlineContent" key that (as a a boolean) represents whether the content should be located to the right
              of the field name (set to true) or if the content should start in the next line to provide extra space (set
              to false)

    Example:
    {
        name: {
            mrn: "123",
            fullName: "Jane Doe",
            treatmentId: "1"
        },
        sections: [
            {
                title: "Treatment Details",
                fields: [
                    {
                        name: "Date",
                        content: "January 18, 2025"
                        inlineContent: true
                    }
                ]
            }
        ]
    }
    ----------------------------------------------------------------------------------------------------------------------
    */

    // file style properties (e.g. font, text size, bold, spacing)
    const fileStyle = {
        general: {
            startingX: 10,
            indent: 60
        },

        title: {
            size: 18,
            font: "helvetica",
            type: "bold"
        },

        sectionTitle: {
            size: 14,
            font: "helvetica",
            type: "bold",
        },

        fields: {
            size: 12,
            font: "helvetica",
            type: {
                name: "bold",
                content: "normal",
            }
        },

        spacing: {
            afterTitle: 20,
            afterSectionTitle: 10,
            afterFieldRow: 7,
            afterExtraSpaceRow: 10,
            afterSection: 10
        },

        underline: {
            lineWidth: 0.5,
            margin: 2,
            length: 200
        }
    }

    // create, format, and download PDF
    const downloadAsPDF = () => {
        const pdf = new jsPDF();

        // helper function to draw section titles
        const drawSectionTitle = (pdf, title, y) => {
            // setting text properties
            pdf.setFontSize(fileStyle.sectionTitle.size);
            pdf.setFont(fileStyle.sectionTitle.font, fileStyle.sectionTitle.type);
            pdf.text(title, fileStyle.general.startingX, y);
            pdf.setLineWidth(fileStyle.underline.lineWidth);
            pdf.line(fileStyle.general.startingX, y + fileStyle.underline.margin, fileStyle.underline.length, y + fileStyle.underline.margin); // underline
            return y + fileStyle.spacing.afterSectionTitle;
        };

        // helper function to draw field and content inline
        const drawFieldContentInline = (pdf, field, content, y) => {
            // setting text properties
            pdf.setFontSize(fileStyle.fields.size);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.name);
            pdf.text(field, fileStyle.general.startingX, y);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.content);
            pdf.text(content, fileStyle.general.indent, y); // indent content (for alignment)
            return y + fileStyle.spacing.afterFieldRow;
        };

        // Helper function to draw field with content on a new line
        const drawFieldContentExtraSpace = (pdf, field, content, y) => {
            // setting text properties
            pdf.setFontSize(fileStyle.fields.size);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.name);
            pdf.text(field, fileStyle.general.startingX, y);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.content);
            y += fileStyle.spacing.afterFieldRow; // Move to the next line for the content
            pdf.text(content, fileStyle.general.startingX, y);
            return y + fileStyle.spacing.afterExtraSpaceRow; // Add spacing after the content
        };

        // adding report title
        const title = fileData.title;
        pdf.setFontSize(fileStyle.title.size);
        pdf.setFont(fileStyle.title.font, fileStyle.title.type);
        pdf.text(title, fileStyle.general.startingX, fileStyle.general.startingX);

        // start position for the first section
        let y = fileStyle.spacing.afterTitle;

        // creating and formating each section
        fileData.sections.forEach((section, index) => {
            y = drawSectionTitle(pdf, section.title, y) // adding title
            // creating and formatting each field
            section.fields.forEach((field) => {
                if(field.inlineContent) { // adding inline content
                    y = drawFieldContentInline(pdf, `${field.name}:`, field.content, y)
                } else { // adding extra space
                    y = drawFieldContentExtraSpace(pdf, `${field.name}:`, field.content, y)
                }
            })
            // adding spacing after section (except on last iteration)
            if (index < fileData.sections.length - 1) {
                y += fileStyle.spacing.afterSection;
            }
        })

        // downloading PDF
        // naming convention: <patient-MRN>_<patient-name>_<treatment-id>.pdf
        // name is all lowercase
        pdf.save(`${fileData.name.mrn.toLowerCase()}_${fileData.name.fullName.toLowerCase()}_${fileData.name.treatmentId}`);
    };

    return <div>
        <Button onClick={downloadAsPDF}>Download as PDF</Button>
    </div>
}

export default ReportGeneration;