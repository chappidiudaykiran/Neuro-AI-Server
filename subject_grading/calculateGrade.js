const SubjectFeedback = require('../models/SubjectFeedback');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const User = require('../models/User');
const Subject = require('../models/Subject');

/**
 * Calculates a consolidated "Grade" (0-100) combining watch history progress and assignment scores.
 * 
 * Logic Breakdown:
 * - 50% Weight from Watch Progress (completionPct tracked via SubjectFeedback).
 * - 50% Weight from Assignment Performance (Total Correct / Total Attempted).
 * 
 * @param {String} userId - The MongoDB ObjectId of the user.
 * @returns {Array} An array of grade objects detailing performance per enrolled subject.
 */
async function calculateStudentSubjectGrades(userId) {
    try {
        const user = await User.findById(userId).populate('selectedSubjects', 'name stressTag');
        if (!user || !user.selectedSubjects || user.selectedSubjects.length === 0) {
            return []; // No enrolled subjects
        }

        const grades = [];

        for (const subject of user.selectedSubjects) {
            let grade = 0;
            
            // 1. Calculate Watch Progress
            // We fetch the most recent feedback or aggregate max completionPct
            const feedbacks = await SubjectFeedback.find({ userId, subjectId: subject._id });
            const maxCompletion = feedbacks.reduce((acc, curr) => Math.max(acc, curr.completionPct || 0), 0);
            
            // Watch Progress contributes 50 points out of 100
            const watchScoreComponent = (Math.min(maxCompletion, 100) / 100) * 50;

            // 2. Calculate Assignment Performance
            const submissions = await AssignmentSubmission.find({ userId, subjectId: subject._id });
            
            let totalCorrect = 0;
            let totalAttempted = 0;

            for (const sub of submissions) {
                if (typeof sub.score === 'number' && typeof sub.totalQuestions === 'number' && sub.totalQuestions > 0) {
                    totalCorrect += sub.score;
                    totalAttempted += sub.totalQuestions;
                }
            }

            let assignmentScoreComponent = 0;
            if (totalAttempted > 0) {
                // Assignment Performance contributes 50 points out of 100
                assignmentScoreComponent = (totalCorrect / totalAttempted) * 50;
            } else if (maxCompletion > 0 && totalAttempted === 0) {
                // Edge case: User watched modules but hasn't taken assignments yet.
                // We use their watch progress as a baseline projection instead of penalizing heavily.
                assignmentScoreComponent = (watchScoreComponent / 50) * 20; // Soft baseline
            }

            grade = watchScoreComponent + assignmentScoreComponent;

            grades.push({
                subjectId: subject._id,
                subjectName: subject.name,
                stressTag: subject.stressTag,
                watchProgress: maxCompletion,
                assignmentPerformance: totalAttempted > 0 ? Math.round((totalCorrect/totalAttempted)*100) : 0,
                calculatedGrade: Math.round(grade)
            });
        }

        return grades;
    } catch (error) {
        console.error("Error calculating subject grades:", error);
        return [];
    }
}

/**
 * Returns a cleanly formatted numbered list of the user's enrolled subjects and their calculated grades.
 * Useful for injecting directly into LLM prompts or ML text pipelines.
 */
async function getFormattedGradesList(userId) {
    const grades = await calculateStudentSubjectGrades(userId);
    if (!grades || grades.length === 0) return "No enrolled subjects.";

    return grades.map((g, index) => {
        return `${index + 1}) ${g.subjectName} (Grade: ${g.calculatedGrade} | Stress: ${g.stressTag})`;
    }).join('\n');
}

module.exports = {
    calculateStudentSubjectGrades,
    getFormattedGradesList
};
