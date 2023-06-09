// Transcript+ 
// Version: 0.0.5
// By: rmnst.dev@gmail.com

/**
 * 1. Try-Catch Implementation
 * 2. Security Fix (Remove all innerHTML)
 * 3. Implement 4-point scale GPA computation
 */

// Modifies web page styling
changeHTMLBodyText("Transcript of Records", "Transcript of Records+");
addNewColumnToTranscriptTable("Grade Unit Value");
addNewColumnToTranscriptTable("Letter Grade");
addNewColumnToTranscriptTable("Numerical Equivalent");
addNewColumnToTranscriptTable("Grade Point");

// Variables 
var trancriptTableRow = document.getElementsByClassName('mws-table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr');
var sumUnits = 0;
var sumGUV = 0;
var accUnits = 0;
var accGUV = 0;
var sumGP = 0;
// Compute GPA
var accGP = 0;
var noFailure = true;

for(var i = 0; i < trancriptTableRow.length; i++) {

    // Get substring if course number is NSTP-CWTS 1 or NSTP-CWTS 2
    var nstpCourseNumber = trancriptTableRow[i].innerText.substring(0,trancriptTableRow[i].innerText.indexOf("-"));

    if(trancriptTableRow[i].childElementCount != 1){
        
        // Create additional cells onto the existing grade rows
        // Grade Unit Value Row
        var guvRow = insertAdditionalCellToGradeRow("guvRow", i, "center");
        // Letter Grade Equivalent Row
        var lgeRow = insertAdditionalCellToGradeRow("lgeRow", i, "center");
        // Numerical Equivalent Row
        var neRow = insertAdditionalCellToGradeRow("neRow", i, "center");
        // Grade Point Row
        var gpRow = insertAdditionalCellToGradeRow("gpRow", i, "center");

        // Grade logic
        // Edge-case on In Progress grades
        var gradeCell = trancriptTableRow[i].getElementsByTagName('td')[2].innerHTML;
        var grade = "";
        var units = "";
        try {
            if(gradeCell.includes("In Progress")) {
                grade = '0';
                units = '0';
            } else {
                grade = trancriptTableRow[i].getElementsByTagName('td')[2].getElementsByTagName('strong')[0].innerHTML;
                units = trancriptTableRow[i].getElementsByTagName('td')[3].innerHTML;
            }
        } catch(err) {
            console.log(err);
            grade = '0';
            units = '0';
        };


        // Grade logic edge-cases
        // Edge-case on legend grades grades
        if(!(/^\d+$/.test(grade))){
            grade = checkLegendGrade(grade);
            units = '0';
        };

        // Append Table Data
        // GUV Row
        if(nstpCourseNumber !== 'NSTP'){
            var gupValue = parseFloat(grade) * parseFloat(units);
        } else {
            var gupValue = parseFloat(0);
        }
        guvRow.appendChild(document.createTextNode(gupValue));
        trancriptTableRow[i].appendChild(guvRow);
        // Letter Grade Equivalent Row
        lgeRow.appendChild(document.createTextNode(checkLetterGradeEquivalent(parseFloat(grade))));
        trancriptTableRow[i].appendChild(lgeRow);
        // Numerical Grade Equivalent Row
        neRow.appendChild(document.createTextNode(checkNumericalEquivalent(parseFloat(grade))));
        trancriptTableRow[i].appendChild(neRow);
        // Grade Point Row
        var gradePoint = parseFloat(units)*parseFloat(checkNumericalEquivalent(parseFloat(grade)))
        gpRow.appendChild(document.createTextNode(gradePoint));
        trancriptTableRow[i].appendChild(gpRow);

        // Sum values
        // Skip NSTP
        if(nstpCourseNumber !== 'NSTP'){
            var sumUnits = parseFloat(sumUnits) + parseFloat(units);
            var sumGUV = parseFloat(sumGUV) + gupValue;
            var sumGP = parseFloat(sumGP) + gradePoint;
        }
        var average = parseFloat(sumGUV/sumUnits);

        // For GPA
        accGP = parseFloat(accGP) + parseFloat(gradePoint); 

        // Check if it is time to add average grade row
        let midTable = Boolean(i < trancriptTableRow.length-1);
        let endTable = Boolean(i === trancriptTableRow.length-1)

        if(midTable) {
            var checkSemesterHeader = trancriptTableRow[i+1].innerText.substring(0,trancriptTableRow[i+1].innerText.indexOf(","));
        } 

        if((midTable && (checkSemesterHeader === 'SECOND SEMESTER' || checkSemesterHeader === 'FIRST SEMESTER')) || (endTable)){

                insertTranscriptRowAndCell(document.getElementsByClassName('mws-table')[0], i+2, 7, 'avgRow', i)
                textFormatCell(document.getElementById('avgRow'+i+'-1'), "right", "bold", "AVERAGE");
                textFormatCell(document.getElementById('avgRow'+i+'-2'), "center", "bold", nanGradeInProgress(average, 2))
                textFormatCell(document.getElementById('avgRow'+i+'-3'), "center", "bold", sumUnits);
                textFormatCell(document.getElementById('avgRow'+i+'-4'), "center", "bold", sumGUV);
                textFormatCell(document.getElementById('avgRow'+i+'-5'), "center", "bold", checkLetterGradeEquivalent(nanGradeInProgress(average, 2)));
                textFormatCell(document.getElementById('avgRow'+i+'-6'), "center", "bold", checkNumericalEquivalent(nanGradeInProgress(average, 2)));
                textFormatCell(document.getElementById('avgRow'+i+'-7'), "center", "bold", nanGradeInProgress(parseFloat(sumGP/sumUnits), 2));

                accGUV = accGUV + sumGUV;
                accUnits = accUnits + sumUnits;
                sumUnits = 0;
                sumGUV = 0;
                sumGP = 0;

                i++;
        };
    } else {
        var semesterRowHeader = trancriptTableRow[i].getElementsByTagName('td')[0];
        semesterRowHeader.colSpan = '8';
    };
};

// Create summary row
insertTranscriptHeaderRow(document.getElementsByClassName('mws-table')[0], -1, 7, 'combined-avg-header', "<strong>SUMMARY</strong>");

var combinedAverage = parseFloat(accGUV/accUnits); 
// Accumulated Average
insertSummaryRows('comAvgRow', 'S-001', 'GENERAL WEIGHTED AVERAGE (GWA)', combinedAverage.toFixed(4), 6);
// Completed Units
insertSummaryRows('comUnits', 'S-002', 'COMPLETED UNITS', accUnits, 6)
// Grade Unit Value Sum
insertSummaryRows('comGUV', 'S-003', 'GRADE UNIT VALUE SUM', accGUV, 6)
// Letter Grade
insertSummaryRows('comLetter', 'S-004', 'LETTER GRADE', checkLetterGradeEquivalent(combinedAverage), 6)
// Numerical Equivalent
insertSummaryRows('comNumEq', 'S-005', 'NUMERICAL EQUIVALENT GRADE', checkNumericalEquivalent(combinedAverage), 6)
// Grade Point Average
insertSummaryRows('comGPA', 'S-006', 'GRADE POINT AVERAGE (GPA)', parseFloat(accGP/accUnits).toFixed(4), 6)
// Add honor potential
insertSummaryRows('comHonRow', 'S-007', 'REMARKS', checkGradStatusHonors(combinedAverage), 6)

// Add remarks below
insertDivRemark("*NSTP-CWTS 1, NSTP-CWTS 2, and any course number providing a legend grade of HP, P, or F were excluded in any computation. If there are other subjects like this in your program, please feel free to reach out via the extension's contact email.");
insertDivRemark("*Letter Grade and Numerical Equivalent values were retrieved from the SLU Handbook 2015 Edition.");
insertDivRemark("<br>*You may send your feedback (Errors, Bugs, Recommendations) to the extension's contact email. I am not affiliated with SLU TMDD. This browser extension project was made for fun and productivity. Thank you for trying it out :)");

// GENERAL FUNCTIONS
// Insert summary rows
function insertSummaryRows(rowNameDiscriminator, summaryRowCode, summaryRowTitle, summaryRowValue, columnSpan) {
    insertTranscriptRowAndCell(document.getElementsByClassName('mws-table')[0], -1, 2, rowNameDiscriminator, 0)
    textFormatCell(document.getElementById(rowNameDiscriminator+"0-0"), "center", "normal", summaryRowCode);
    textFormatCell(document.getElementById(rowNameDiscriminator+"0-1"), "center", "bold", summaryRowTitle);
    textFormatCell_B(document.getElementById(rowNameDiscriminator+"0-2"), "center", "bold", summaryRowValue, columnSpan);
}

// Insert a new cell to a grade row
function insertAdditionalCellToGradeRow(idName, idIndex, cellTextAlign) {
    var gradeRowCell = document.createElement('td');
    gradeRowCell.setAttribute("id", idName+idIndex);
    gradeRowCell.style.textAlign = cellTextAlign;
    return gradeRowCell;
}

// Insert remark at the bottom of the page
function insertDivRemark(remarkText) {
    var remarkElement = document.createElement("div");
    remarkElement.innerHTML = remarkText;
    remarkElement.style.fontStyle = "italic";
    document.getElementsByClassName('container')[0].appendChild(remarkElement);
}

// Insert new row and cells into table 
function insertTranscriptRowAndCell(table, rowIndex, numberOfCells, rowIdName, rowIdDiscriminator) {
    var row = table.insertRow(rowIndex);
    for(var x = 0; x <= numberOfCells; x++){
        var cell = row.insertCell(x);
        cell.setAttribute("id", rowIdName + rowIdDiscriminator + '-' + x);
    }
};

// Insert new header row
function insertTranscriptHeaderRow(table, rowIndex, columnSpan, rowIdName, cellInnerHTML) {
    var row = table.insertRow(rowIndex);
    var cell = row.insertCell(0);
    cell.setAttribute("id", rowIdName);
    cell.colSpan = columnSpan;
    cell.innerHTML = cellInnerHTML;
}

// Format cell style
function textFormatCell(cell, cellTextAlign, cellFontWeight, cellInnerHTML) {
    cell.style.textAlign = cellTextAlign;
    cell.style.fontWeight = cellFontWeight;
    cell.innerHTML = cellInnerHTML;
};

// Format cell style with column span
function textFormatCell_B(cell, cellTextAlign, cellFontWeight, cellInnerHTML, cellColSpan) {
    cell.style.textAlign = cellTextAlign;
    cell.style.fontWeight = cellFontWeight;
    cell.innerHTML = cellInnerHTML;
    cell.colSpan = cellColSpan;
};

// Check if average value is 'NaN' as caused by the grade row being "In Progress"
function nanGradeInProgress(average, decimalValues) {
    if(isNaN(average)){
        return 'N/A'
    } else {
        return average.toFixed(decimalValues);
    };
};

// Determine if the student is vying for a latin honor
function checkGradStatusHonors(combinedAverageValue) {
    if(combinedAverageValue >= 93){return "LATIN HONOR POTENTIAL: SUMMA CUM LAUDE";} 
    else if(combinedAverageValue >= 91) {return "LATIN HONOR POTENTIAL: MAGNA CUM LAUDE";} 
    else if(combinedAverageValue >= 88) {return "LATIN HONOR POTENTIAL: CUM LAUDE";} 
    else if(combinedAverageValue >= 75) {return "PASSING";} 
    else {return"FAILING";};
};

// Determine Letter Grade from Percentage Equivalent
function checkLetterGradeEquivalent(grade) {
    if(grade === 'N/A') {return 'N/A'}
    else if(grade >= 97) {return 'A'}
    else if(grade >= 94) {return 'A-'}
    else if(grade >= 91) {return 'B+'}
    else if(grade >= 88) {return 'B'}
    else if(grade >= 85) {return 'B-'}
    else if(grade >= 80) {return 'C+'}
    else if(grade >= 75) {return 'C'}
    else { return 'D'}
}

// Determine Numerical Equivalent from Percentage Equivalent
function checkNumericalEquivalent(grade) {
    if(grade === 'N/A') {return 'N/A'}
    else if(grade >= 97) {return '1.00'}
    else if(grade >= 94) {return '1.25'}
    else if(grade >= 91) {return '1.50'}
    else if(grade >= 88) {return '1.75'}
    else if(grade >= 85) {return '2.00'}
    else if(grade >= 80) {return '2.50'}
    else if(grade >= 75) {return '3.00'}
    else { return '4.00'}
}

// Determine Reverse Numerical Equivalent from Percentage Equivalent
function checkNumericalEquivalent_B(grade) {
    if(grade === 'N/A') {return 'N/A'}
    else if(grade >= 97) {return '4.00'}
    else if(grade >= 94) {return '3.75'}
    else if(grade >= 91) {return '3.50'}
    else if(grade >= 88) {return '3.25'}
    else if(grade >= 85) {return '3.00'}
    else if(grade >= 80) {return '2.50'}
    else if(grade >= 75) {return '2.00'}
    else { return '1.00'}
}

// Determine Legend Grade
function checkLegendGrade(grade) {
    switch(grade) {
        case 'N/A':
            return '0'
        case 'HP':
            return '97'
        case 'P':
            return '85'
        case 'F':
            return '74'
        case 'INC':
        case 'D':
        case 'NC':
        case 'WP':   
        case 'NFE':
            return '0' 
        default:
            return '0'       
    }
}

// STYLE FUNCTIONS
// Replace a text in the current page
function changeHTMLBodyText(textToReplace, textReplacement) {
    document.body.innerHTML = document.body.innerHTML.replace(textToReplace, textReplacement);
};

// Add a new column to the transcript table
function addNewColumnToTranscriptTable(tableHeaderName) {
    var transcriptTable = document.getElementsByClassName('mws-table')[0].getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];
    var newColumn = document.createElement('th');
    newColumn.innerHTML = tableHeaderName;
    transcriptTable.appendChild(newColumn);
};