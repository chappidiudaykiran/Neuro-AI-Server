const SubjectFeedback = require('../models/SubjectFeedback');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const User = require('../models/User');
const Subject = require('../models/Subject');

/**
 * Calculates a consolidated "Grade" (0-100) using a 3-factor weighted system:
 * 
 * Grade = 40% Watch Progress + 40% Quiz Accuracy + 20% Consistency Bonus
 * 
 * Logic Breakdown:
 * - 40% Weight from Watch Progress (completionPct tracked via SubjectFeedback).
 * - 40% Weight from Assignment Performance (Total Correct / Total Attempted).
 * - 20% Weight from Consistency Bonus (unique active days in the last 30 days).
 * 
 * Consistency Bonus:
 *   Measures how regularly the student engages with a subject.
 *   Counts unique calendar days with activity (from SubjectFeedback or AssignmentSubmission).
 *   Target: 15 unique active days in the last 30 days = 100% consistency.
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
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const CONSISTENCY_TARGET_DAYS = 15; // 15 active days = 100% consistency

        for (const subject of user.selectedSubjects) {
            // 1. Calculate Watch Progress (40 points max)
            const feedbacks = await SubjectFeedback.find({ userId, subjectId: subject._id });
            const maxCompletion = feedbacks.reduce((acc, curr) => Math.max(acc, curr.completionPct || 0), 0);
            const watchScoreComponent = (Math.min(maxCompletion, 100) / 100) * 40;

            // 2. Calculate Assignment Performance (40 points max)
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
                assignmentScoreComponent = (totalCorrect / totalAttempted) * 40;
            } else if (maxCompletion > 0 && totalAttempted === 0) {
                // Edge case: Watched but no quizzes yet → soft baseline projection
                assignmentScoreComponent = (watchScoreComponent / 40) * 15;
            }

            // 3. Calculate Consistency Bonus (20 points max)
            // Count unique calendar days with any activity in the last 30 days
            const recentFeedbacks = feedbacks.filter(f => f.createdAt && f.createdAt >= thirtyDaysAgo);
            const recentSubmissions = submissions.filter(s => s.createdAt && s.createdAt >= thirtyDaysAgo);

            const activeDaysSet = new Set();
            for (const f of recentFeedbacks) {
                activeDaysSet.add(f.createdAt.toISOString().split('T')[0]); // e.g. "2026-04-10"
            }
            for (const s of recentSubmissions) {
                activeDaysSet.add(s.createdAt.toISOString().split('T')[0]);
            }

            const uniqueActiveDays = activeDaysSet.size;
            const consistencyPct = Math.min(uniqueActiveDays / CONSISTENCY_TARGET_DAYS, 1); // 0 to 1
            const consistencyScoreComponent = consistencyPct * 20;

            const grade = watchScoreComponent + assignmentScoreComponent + consistencyScoreComponent;

            grades.push({
                subjectId: subject._id,
                subjectName: subject.name,
                stressTag: subject.stressTag,
                watchProgress: maxCompletion,
                assignmentPerformance: totalAttempted > 0 ? Math.round((totalCorrect/totalAttempted)*100) : 0,
                consistencyScore: Math.round(consistencyPct * 100), // 0-100% for frontend display
                activeDays: uniqueActiveDays,
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
        return `${index + 1}) ${g.subjectName} (Grade: ${g.calculatedGrade} | Consistency: ${g.consistencyScore}% | Stress: ${g.stressTag})`;
    }).join('\n');
}

module.exports = {
    calculateStudentSubjectGrades,
    getFormattedGradesList
};
