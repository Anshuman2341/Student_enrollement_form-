const dbBaseUrl = "http://api.login2explore.com:5577";
const apiEndPointUrl = "/api/iml";
const token = "90934423|-31949230455569334|90956819";

$(document).readyfunction ();{
    // Initialize form on page load
    resetForm();

    // Function to reset the form
    function resetForm() {
        $("#rollNo").val("").prop("disabled", false);
        $("#fullName, #class, #birthDate, #address, #enrollmentDate").val("").prop("disabled", true);
        $("#saveBtn, #changeBtn, #resetBtn").prop("disabled", true);
        $("#rollNo").focus(); // Set cursor to Roll-No field
    }

    // Function to validate form data
    function validateAndGetFormData() {
        const rollNo = $("#rollNo").val().trim();
        const fullName = $("#fullName").val().trim();
        const className = $("#class").val().trim();
        const birthDate = $("#birthDate").val().trim();
        const address = $("#address").val().trim();
        const enrollmentDate = $("#enrollmentDate").val().trim();

        if (!rollNo || !fullName || !className || !birthDate || !address || !enrollmentDate) {
            alert("All fields are required!");
            return null;
        }

        return {
            Roll_No: rollNo,
            Full_Name: fullName,
            Class: className,
            Birth_Date: birthDate,
            Address: address,
            Enrollment_Date: enrollmentDate,
        };
    }

    // Function to create PUT request
    function createPUTRequest(connToken, jsonObj, dbName, relName) {
        return JSON.stringify({
            token: connToken,
            dbName: dbName,
            cmd: "PUT",
            rel: relName,
            jsonStr: JSON.stringify(jsonObj),
        });
    }

    // Function to execute a command asynchronously
    async function executeCommand(reqString) {
        try {
            const response = await $.ajax({
                url: dbBaseUrl + apiEndPointUrl,
                type: "POST",
                data: reqString,
                contentType: "application/json",
            });
            return response;
        } catch (error) {
            console.error("Error:", error.responseText);
            return null;
        }
    }

    // On blur of Roll-No field
    $("#rollNo").on("blur", async function () {
        const rollNo = $("#rollNo").val().trim();

        if (!rollNo) {
            alert("Roll Number is required!");
            resetForm();
            return;
        }

        const getRequest = JSON.stringify({
            token: token,
            dbName: "SCHOOL-DB",
            cmd: "GET",
            rel: "STUDENT-TABLE",
            jsonStr: JSON.stringify({ Roll_No: rollNo }),
        });

        const result = await executeCommand(getRequest);

        if (!result) {
            alert("Error checking Roll-No in database!");
            resetForm();
            return;
        }

        const data = JSON.parse(result);

        if (data.status === 400) {
            // Roll-No does not exist; allow data entry
            $("#fullName, #class, #birthDate, #address, #enrollmentDate").prop("disabled", false);
            $("#saveBtn, #resetBtn").prop("disabled", false);
            $("#rollNo").prop("disabled", true);
            $("#fullName").focus(); // Move cursor to Full Name field
        } else if (data.status === 200) {
            // Roll-No exists; populate data and enable change/reset
            const student = JSON.parse(data.data);

            $("#fullName").val(student.Full_Name);
            $("#class").val(student.Class);
            $("#birthDate").val(student.Birth_Date);
            $("#address").val(student.Address);
            $("#enrollmentDate").val(student.Enrollment_Date);

            $("#changeBtn, #resetBtn").prop("disabled", false);
            $("#rollNo").prop("disabled", true);
            $("#fullName").focus(); // Move cursor to Full Name field
        } else {
            alert("Unexpected response from database!");
            resetForm();
        }
    });

    // Save button functionality
    $("#saveBtn").click(async function () {
        const formData = validateAndGetFormData();
        if (!formData) return;

        const putRequest = createPUTRequest(token, formData, "SCHOOL-DB", "STUDENT-TABLE");
        const result = await executeCommand(putRequest);

        if (result && JSON.parse(result).status === 200) {
            alert("Student data saved successfully!");
            resetForm();
        } else {
            alert("Error saving student data!");
        }
    });

    // Change button functionality
    $("#changeBtn").click(async function () {
        const formData = validateAndGetFormData();
        if (!formData) return;

        const putRequest = createPUTRequest(token, formData, "SCHOOL-DB", "STUDENT-TABLE");
        const result = await executeCommand(putRequest);

        if (result && JSON.parse(result).status === 200) {
            alert("Student data updated successfully!");
            resetForm();
        } else {
            alert("Error updating student data!");
        }
    });

}
