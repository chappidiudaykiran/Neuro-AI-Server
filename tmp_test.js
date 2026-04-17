const axios = require('axios');

async function testML() {
    try {
        const payload = {
            "student_id": "STU-123",
            "features": {
                "StudyHours": 5.0,
                "Attendance": 80.0,
                "Resources": 3.0,
                "OnlineCourses": 2.0,
                "Discussions": 4.0,
                "AssignmentCompletion": 85.0,
                "EduTech": 3.0,
                "Extracurricular": 1.0
            }
        };
        const url = 'http://10.0.2.24:8000/api/v1/predict/';
        console.log(`Sending POST to ${url}...`);
        const res = await axios.post(url, payload);
        console.log("Success! Response:");
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error(`Error: ${err.response.status} ${err.response.statusText}`);
            console.error("Data:", err.response.data);
            console.error("URL hit:", err.config.url);
        } else {
            console.error(err.message);
        }
    }
}

testML();
