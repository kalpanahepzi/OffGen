const { createApp } = Vue;
const { jsPDF } = window.jspdf;

createApp({
    data() {
        return {
            form: {
                employerName: '',
                employerAddress: '',
                employeeFirstName: '',
                employeeLastName: '',
                employeeAddress: '',
                position: '',
                department: '',
                startDate: '',
                compensation: '',
                workingHours: '',
                probationPeriod: 1,
                employmentType: 'Full-Time',
                capacityUtilization: '40 hours/week',
                managerName: '',
                managerDesignation: '',
                offerExpirationDays: 10
            },
            companyLogo: null,
            pdfUrl: null
        }
    },
    methods: {
        handleLogoUpload(event) {
            const file = event.target.files[0];
            if (file && file.type === "image/png" && file.size <= 1024 * 1024) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.companyLogo = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                alert("Please upload a PNG file no larger than 1MB.");
                event.target.value = '';
            }
        },
        updateCapacityUtilization() {
            this.form.capacityUtilization = this.form.employmentType === 'Full-Time' ? '40 hours/week' : '20 hours/week';
        },
        generatePDF() {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            let y = margin;

            const fontSize = {
                normal: 10,
                title: 16,
                subtitle: 12
            };

            const addMultiLineText = (text, x, y, maxWidth, options = {}) => {
                const { fontSize = 10, align = 'left', font = 'normal' } = options;
                doc.setFontSize(fontSize);
                doc.setFont("helvetica", font);
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, x, y, { align: align });
                return y + (lines.length * (fontSize / 2));
            };

            const addWatermark = () => {
                if (this.companyLogo) {
                    const logoWidth = 100;
                    const logoHeight = 50;
                    const logoX = (pageWidth - logoWidth) / 2;
                    const logoY = (pageHeight - logoHeight) / 2;

                    doc.saveGraphicsState();
                    doc.setGState(new doc.GState({opacity: 0.1}));
                    doc.addImage(this.companyLogo, 'PNG', logoX, logoY, logoWidth, logoHeight);
                    doc.restoreGraphicsState();
                }
            };

            const addPageHeader = () => {
                let initialY = y;
                addMultiLineText(this.form.employerName, margin, y, pageWidth - 2 * margin, { fontSize: fontSize.title, font: 'bold' });
                y = addMultiLineText(this.form.employerAddress, pageWidth - margin, y, pageWidth - 2 * margin, { fontSize: fontSize.normal, align: 'right' });
                
                y += 10;
                addMultiLineText('Employment Agreement', pageWidth / 2, y, pageWidth - 2 * margin, { fontSize: fontSize.title, font: 'bold', align: 'center' });
                
                y += 10;
                
                return y - initialY;
            };

            const checkNewPage = (neededSpace) => {
                if (y + neededSpace > pageHeight - margin) {
                    doc.addPage();
                    addWatermark();
                    y = margin;
                    y += addPageHeader();
                }
            };

            addWatermark();
            y += addPageHeader();

            y += 5;

            addMultiLineText(`Date: ${new Date().toLocaleDateString()}`, margin, y, pageWidth - 2 * margin);
            
            y += 10;
            addMultiLineText(`${this.form.employeeFirstName} ${this.form.employeeLastName}`, margin, y, pageWidth - 2 * margin);
            y = addMultiLineText(this.form.employeeAddress, margin, y + 5, pageWidth - 2 * margin);
            
            y += 10;
            addMultiLineText(`Dear ${this.form.employeeFirstName},`, margin, y, pageWidth - 2 * margin);
            
            y += 10;
            addMultiLineText(`Offer of Employment at ${this.form.employerName}`, margin, y, pageWidth - 2 * margin, { font: 'bold' });
            
            y += 10;
            y = addMultiLineText(`We are thrilled to extend this formal offer of employment for the position ${this.form.position} in our ${this.form.department} at ${this.form.employerName}. Your skills, experience, and enthusiasm stood out during our selection process, and we are excited about the potential contributions you can make to our team.`, margin, y, pageWidth - 2 * margin);
            
            y += 10;
            addMultiLineText(`Position:`, margin, y, pageWidth - 2 * margin, { font: 'bold' });
            addMultiLineText(this.form.position, margin + 50, y, pageWidth - 2 * margin - 50);
            y += 7;
            addMultiLineText(`Department:`, margin, y, pageWidth - 2 * margin, { font: 'bold' });
            addMultiLineText(this.form.department, margin + 50, y, pageWidth - 2 * margin - 50);
            y += 7;
            addMultiLineText(`Start Date:`, margin, y, pageWidth - 2 * margin, { font: 'bold' });
            addMultiLineText(this.form.startDate, margin + 50, y, pageWidth - 2 * margin - 50);
            
            y += 10;
            addMultiLineText(`Compensation:`, margin, y, pageWidth - 2 * margin, { font: 'bold' });
            y = addMultiLineText(`You will receive a total Cost to Company (CTC) annual salary of INR ${this.form.compensation} payable in monthly installments, subject to deductions and withholdings as required by law.`, margin + 50, y, pageWidth - 2 * margin - 50);
            
            y += 10;
            addMultiLineText('Employment Conditions:', margin, y, pageWidth - 2 * margin, { font: 'bold' });
            y += 7;
            doc.circle(margin + 2, y + 2, 1, 'F');
            addMultiLineText(`Probation Period: ${this.form.probationPeriod} month${this.form.probationPeriod > 1 ? 's' : ''}`, margin + 10, y, pageWidth - 2 * margin - 10);
            y += 7;
            doc.circle(margin + 2, y + 2, 1, 'F');
            addMultiLineText(`Employment Type: ${this.form.employmentType}`, margin + 10, y, pageWidth - 2 * margin - 10);
            y += 7;
            doc.circle(margin + 2, y + 2, 1, 'F');
            addMultiLineText(`Capacity Utilization: ${this.form.capacityUtilization}`, margin + 10, y, pageWidth - 2 * margin - 10);
            y += 7;
            doc.circle(margin + 2, y + 2, 1, 'F');
            y = addMultiLineText(`Working Hours: ${this.form.workingHours}`, margin + 10, y, pageWidth - 2 * margin - 10);

            // Force new page for Benefits
            doc.addPage();
            addWatermark();
            y = margin;
            y += addPageHeader();
            
            addMultiLineText('Benefits:', margin, y, pageWidth - 2 * margin, { font: 'bold' });
            y += 7;
            y = addMultiLineText('You will be eligible to participate in the company\'s standard benefits program, which includes health insurance, employee wellness programs, and any other benefits applicable to your position, following any applicable waiting periods.', margin, y, pageWidth - 2 * margin);
            y += 7;
            doc.circle(margin + 2, y + 2, 1, 'F');
            y = addMultiLineText(`Leave Entitlements: You will be entitled to standard company leave, which includes paid vacation, sick leave, and public holidays, as per company policy.`, margin + 10, y, pageWidth - 2 * margin - 10);
            
            checkNewPage(40);
            y += 10;
            addMultiLineText('Confidentiality and Non-Disclosure Agreement:', margin, y, pageWidth - 2 * margin, { font: 'bold' });
            y += 7;
            y = addMultiLineText(`As part of your employment, you will be required to sign and adhere to a confidentiality and non-disclosure agreement to protect the interests of ${this.form.employerName} and its clients.`, margin, y, pageWidth - 2 * margin);
            
            checkNewPage(60);
            y += 10;
            addMultiLineText('At-Will Employment:', margin, y, pageWidth - 2 * margin, { font: 'bold' });
            y += 7;
            y = addMultiLineText(`Please note that your employment with ${this.form.employerName} is at-will, and the employer reserves the right to terminate the employment relationship at any time, with or without cause or prior notice. However, the employee is required to provide a minimum notice period of 30 days in the event of resignation.`, margin, y, pageWidth - 2 * margin);

            checkNewPage(60);
            y += 10;
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + parseInt(this.form.offerExpirationDays));
            y = addMultiLineText(`This offer is contingent upon the satisfactory completion of reference checks and educational verification. Please confirm your acceptance of this offer by signing and returning this letter by ${expirationDate.toLocaleDateString()}.`, margin, y, pageWidth - 2 * margin);

            checkNewPage(40);
            y += 10;
            y = addMultiLineText('We look forward to the opportunity to welcome you to our team. Please feel free to reach out if you have any questions about this offer or your upcoming role with us.', margin, y, pageWidth - 2 * margin);

            checkNewPage(40);
            y += 10;
            addMultiLineText('Yours sincerely,', margin, y, pageWidth - 2 * margin);
            y += 10;
            addMultiLineText('Signature: _______________________', margin, y, pageWidth - 2 * margin);
            y += 10;
            addMultiLineText(this.form.managerName, margin, y, pageWidth - 2 * margin);
            y += 7;
            addMultiLineText(this.form.managerDesignation, margin, y, pageWidth - 2 * margin);
            y += 7;
            addMultiLineText(this.form.employerName, margin, y, pageWidth - 2 * margin);

            checkNewPage(40);
            y += 20;
            addMultiLineText('Signature: _______________________', margin, y, pageWidth - 2 * margin);
            y += 10;
            addMultiLineText('Date: __________________________', margin, y, pageWidth - 2 * margin);
            y += 7;
            y = addMultiLineText('Please review, sign, and return the employment agreement.', margin, y, pageWidth - 2 * margin);
            y += 5;
            y = addMultiLineText('Please keep a copy of this offer letter for your records. If you accept this offer, your signature below will indicate your agreement with the terms outlined in this letter.', margin, y, pageWidth - 2 * margin);
            y += 3;
            y = addMultiLineText(`Once again, we are excited about the possibility of you joining our team and look forward to the positive impact we know you will have at ${this.form.employerName}.`, margin, y, pageWidth - 2 * margin);

            const pdfBlob = doc.output('blob');
            this.pdfUrl = URL.createObjectURL(pdfBlob);
        }
    }
}).mount('#app');