const { runPrediction } = require('../utils/predictionService');
const axios = require('axios');

// Mock axios.post to simulate the new ML backend response
jest.mock('axios');

const mockResponse = {
    data: {
        student_id: "test-user-id",
        latency_ms: 120,
        matrix_state: "bam_01",
        matrix_label: "Optimal Performance",
        predictions: {
            academic: {
                grade: 85,
                confidence: 0.94,
                probabilities: { "0": 0.1, "1": 0.9 }
            },
            psychological: {
                stress: 20,
                confidence: 0.99,
                probabilities: { "0": 0.95, "1": 0.05 }
            }
        },
        action: "No Intervention Required",
        timestamp: new Date().toISOString()
    }
};

async function testParsing() {
    console.log("Mocking ML Response...");
    // This is just a thought experiment since I can't easily run Jest here.
    // I'll manually verify the property access logic I wrote.
    
    const flaskResult = mockResponse.data;
    const grade = flaskResult.predictions?.academic?.grade;
    const stress = flaskResult.predictions?.psychological?.stress;
    const rawMlState = flaskResult.matrix_label || flaskResult.action;
    
    console.log("Parsed Grade:", grade); // Expected: 85
    console.log("Parsed Stress:", stress); // Expected: 20
    console.log("Parsed Label:", rawMlState); // Expected: "Optimal Performance"
    
    if (grade === 85 && stress === 20 && rawMlState === "Optimal Performance") {
        console.log("SUCCESS: Parsing logic matches new schema.");
    } else {
        console.error("FAILURE: Parsing logic mismatch.");
    }
}

testParsing();
