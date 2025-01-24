import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Button, Dropdown } from 'antd';
import { saveAs } from 'file-saver';
import { DownloadOutlined } from '@ant-design/icons';
import styles from '../../css/ReportGeneration.module.css'
import { useState } from 'react';

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
        - An optional "type" key for the type (as a string) of content. This can either be:
            - "text" if the content is a string. If not provided, it will be defaulted to this.
            - "imageArray" if the content is an array of image URLs as strings.
            - "textArray" if the content is an array of strings.
        - A "content" key for the actual content (as a string or array of image URLs) for that respective field
        - A "inlineContent" key that (as a a boolean) represents whether the content should be located to the right
            of the field name (set to true) or if the content should start in the next line to provide extra space (set
            to false). This is only used if the "type" is set to text (or "type" is not provided).

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
                },
                {
                    name: "Treatment Images",
                    type: "imageArray"
                    content: [
                        "image1.com",
                        "image2.com"
                    ]
                }
            ]
        }
    ]
}
----------------------------------------------------------------------------------------------------------------------
*/

function ReportGeneration({fileData, disabled}) {
    const [downloadInProgress, setDownloadInProgress] = useState(false);

    // file style properties (e.g. font, text size, bold, spacing)
    const fileStyle = {
        general: {
            startingX: 10,
            startingY: 10,
            indent: 70
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
            afterSection: 10,
            afterBulletList: 5
        },

        underline: {
            lineWidth: 0.5,
            margin: 2,
            length: 200
        },

        image: {
            size: 50
        },
        
        bullets: {
            indent: 15
        }
    }

    // naming convention: <patient-MRN>_<patient-name>_<treatment-id>
    // name is all lowercase
    const createTitle = () => {
        return `${fileData.name.mrn.toLowerCase()}_${fileData.name.fullName.toLowerCase()}_${fileData.name.treatmentId}`;
    }

    // create, format, and download CSV
    const downloadAsCSV = () => {
        // disabling button
        setDownloadInProgress(true);
        // creating a string that will contain csv content
        let csvContent = "";
    
        // adding title
        const title = fileData.title;
        csvContent += `${title}\n`;
    
        // creating and formating each section
        fileData.sections.forEach((section, sectionIndex) => {
            // adding section title
            csvContent += `${section.title}\n`;
    
            // creating and formating each field
            section.fields.forEach((field) => {
                if (field.content === '' || field.content === null) { // skipping null content (error checking)
                    return;
                }
    
                // adding field and content in side-by-side cells
                csvContent += `${field.name},"${field.content}"\n`;
            });
    
            // adding spacing after section (except on the last iteration)
            if (sectionIndex < fileData.sections.length - 1) {
                csvContent += "\n";
            }
        });
    
        // downloading as CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${createTitle()}.csv`);
        // enabling button
        setDownloadInProgress(false)
    };    

    // create, format, and download PDF
    const downloadAsPDF = async () => {
        // disabling button
        setDownloadInProgress(true)
        const pdf = new jsPDF();
        const pageHeight = pdf.internal.pageSize.height; // getting page height

        // helper function to check if a new page is needed
        const checkPageBreak = (currentY, spaceNeeded) => {
            if (currentY + spaceNeeded > pageHeight - fileStyle.general.startingY) {
                pdf.addPage(); // Add a new page
                return fileStyle.general.startingY;
            }
            return currentY;
        };

        // helper function to draw section titles
        const drawSectionTitle = (pdf, title, y) => {
            // checking if new page needed
            y = checkPageBreak(y, fileStyle.spacing.afterSectionTitle)
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
            // checking if new page needed
            y = checkPageBreak(y, fileStyle.spacing.afterFieldRow)
            // setting text properties
            pdf.setFontSize(fileStyle.fields.size);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.name);
            pdf.text(field, fileStyle.general.startingX, y);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.content);
            pdf.text(content, fileStyle.general.indent, y); // indent content (for alignment)
            return y + fileStyle.spacing.afterFieldRow;
        };

        // helper function to draw field with content on a new line
        const drawFieldContentExtraSpace = (pdf, field, content, y) => {
            // checking if new page needed
            y = checkPageBreak(y, fileStyle.spacing.afterExtraSpaceRow + fileStyle.spacing.afterFieldRow)
            // setting text properties
            pdf.setFontSize(fileStyle.fields.size);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.name);
            pdf.text(field, fileStyle.general.startingX, y);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.content);
            y += fileStyle.spacing.afterFieldRow; // move to the next line for the content
            pdf.text(content, fileStyle.general.startingX, y);
            return y + fileStyle.spacing.afterExtraSpaceRow;
        };

        // helper function to show images
        const drawFieldContentWithImages = async (pdf, field, images, y) => {
            // checking if new page needed
            y = checkPageBreak(y, fileStyle.spacing.afterFieldRow)
            // setting text properties
            pdf.setFontSize(fileStyle.fields.size);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.name);
            pdf.text(field, fileStyle.general.startingX, y);
            y += fileStyle.spacing.afterFieldRow
            for (let i = 0; i < images.length; i++) {
                // checking if new page needed
                y = checkPageBreak(y, 2*fileStyle.image.size + fileStyle.spacing.afterFieldRow)
                const img = images[i];
                const imgData = await fetch(img)
                    .then(res => res.blob())
                    .then(blob => new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    }));
    
                pdf.addImage(imgData, 'JPEG', fileStyle.general.startingX, y, fileStyle.image.size, fileStyle.image.size);
                y += fileStyle.image.size + fileStyle.spacing.afterFieldRow;
            }
            return y + fileStyle.spacing.afterFieldRow;
        };

        // helper function to draw a bullet list
        const drawBulletList = (pdf, field, items, y) => {
            // checking if new page is needed
            y = checkPageBreak(y, fileStyle.spacing.afterSectionTitle)
            // setting text properties
            pdf.setFontSize(fileStyle.fields.size);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.name);
            pdf.text(field, fileStyle.general.startingX, y);
            y += fileStyle.spacing.afterFieldRow // new line for bullets
            pdf.setFontSize(fileStyle.fields.size);
            pdf.setFont(fileStyle.fields.font, fileStyle.fields.type.content);
            items.forEach((item) => {
                // adding each array item as a bullet
                pdf.text(`• ${item}`, fileStyle.bullets.indent, y);
                y += fileStyle.spacing.afterFieldRow;
            });
            return y + fileStyle.spacing.afterBulletList;
        };

        // adding report title
        const title = fileData.title;
        pdf.setFontSize(fileStyle.title.size);
        pdf.setFont(fileStyle.title.font, fileStyle.title.type);
        pdf.text(title, fileStyle.general.startingX, fileStyle.general.startingY);

        // start position for the first section
        let y = fileStyle.spacing.afterTitle;

        // creating and formating each section
        for (const section of fileData.sections) {
            y = drawSectionTitle(pdf, section.title, y) // adding title
            // creating and formatting each field
            for (const field of section.fields) {
                if(field.content == '' || field.content == null) { // skipping null content (error checking)
                    continue
                }
                if(field.type == "imageArray") { // adding images
                    y = await drawFieldContentWithImages(pdf, `${field.name}:`, field.content, y)
                } else if(field.type == "textArray") { // adding list
                    y = drawBulletList(pdf, `${field.name}:`, field.content, y)
                } else if(field.inlineContent) { // adding inline content (assuming type is text)
                    y = drawFieldContentInline(pdf, `${field.name}:`, field.content, y)
                } else { // adding extra space (assuming type is text)
                    y = drawFieldContentExtraSpace(pdf, `${field.name}:`, field.content, y)
                }
            }
            
            // adding spacing after section (except on last iteration)
            if (section !== fileData.sections[fileData.sections.length - 1]) {
                y += fileStyle.spacing.afterSection;
            }
        }

        // downloading PDF
        pdf.save(`${createTitle()}`);
        // enabling button
        setDownloadInProgress(false)
    };

    const menu = {
        items: [
            {
                key: '1',
                label: 'Download as PDF',
                onClick: () => downloadAsPDF(),
            },
            {
                key: '2',
                label: 'Download as CSV',
                onClick: () => downloadAsCSV(),
            },
        ],
    };

    return (
        <div>
            <Dropdown disabled={disabled && downloadInProgress}menu={menu} trigger={['hover']}>
                <Button className={styles.downloadButton} icon={<DownloadOutlined />} size="large">
                    Download Report
                </Button>
            </Dropdown>
        </div>
    );
}

export default ReportGeneration;