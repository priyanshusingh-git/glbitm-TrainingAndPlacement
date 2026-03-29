import { NextResponse } from"next/server"
import prisma from"@/lib/db"
import { authorize } from"@/lib/auth-middleware"
import { logger } from"@/lib/logger"

export async function POST(
 req: Request,
 props: { params: Promise<{ id: string }> }
) {
 const params = await props.params;
 try {
 const authResult = await authorize(req as any, ["STUDENT"])
 if (authResult instanceof NextResponse) {
 return authResult
 }

 const testId = params.id
 const body = await req.json()
 const { answers } = body // Expected: { questionId: string, selectedOptions: string[] }[]

 // 1. Get Student Profile
 const studentProfile = await prisma.studentProfile.findUnique({
 where: { userId: authResult.id }
 })

 if (!studentProfile) {
 return NextResponse.json({ error:"Student profile not found" }, { status: 404 })
 }

 // 2. Check if already submitted
 const existingSubmission = await prisma.submission.findFirst({
 where: {
 testId,
 studentId: studentProfile.id
 }
 })

 if (existingSubmission) {
 return NextResponse.json({ error:"Test already submitted" }, { status: 400 })
 }

 // 3. Fetch Test Questions and Correct Options
 const testQuestions = await prisma.testQuestion.findMany({
 where: { testId },
 include: {
 question: {
 include: {
 options: true
 }
 }
 }
 })

 if (testQuestions.length === 0) {
 return NextResponse.json({ error:"Test has no questions" }, { status: 400 })
 }

 // 4. Calculate Score
 let totalScore = 0
 type SubmissionAnswer = {
 questionId: string;
 selectedOptions: string[];
 isCorrect: boolean;
 }
 const submissionAnswers: SubmissionAnswer[] = []

 for (const tq of testQuestions) {
 const question = tq.question
 const studentAnswer = answers.find((a: any) => a.questionId === question.id)
 const selectedOptions: string[] = studentAnswer?.selectedOptions || []

 const correctOptions = question.options
 .filter(o => o.isCorrect)
 .map(o => o.id)

 // Grading logic:
 // For MCQ/MSQ, all correct options must be selected and no incorrect ones.
 const isCorrect = correctOptions.length > 0 &&
 correctOptions.every(id => selectedOptions.includes(id)) &&
 selectedOptions.every(id => correctOptions.includes(id))

 if (isCorrect) {
 totalScore += 10 // Assuming 10 points per question for now
 }

 submissionAnswers.push({
 questionId: question.id,
 selectedOptions,
 isCorrect
 })
 }

 // 5. Store Submission in Transaction
 const submission = await prisma.$transaction(async (tx) => {
 const newSubmission = await tx.submission.create({
 data: {
 testId,
 studentId: studentProfile.id,
 score: totalScore,
 completedAt: new Date(),
 answers: {
 create: submissionAnswers.map(ans => ({
 questionId: ans.questionId,
 selectedOptions: ans.selectedOptions,
 isCorrect: ans.isCorrect
 }))
 }
 }
 })

 // Also create a TestResult record for legacy compatibility/aggregation
 await tx.testResult.create({
 data: {
 testId,
 studentId: studentProfile.id,
 marksObtained: totalScore,
 remarks: `Auto-graded. Correct: ${submissionAnswers.filter((a: any) => a.isCorrect).length}/${testQuestions.length}`
 }
 })

 return newSubmission
 })

 return NextResponse.json({
 message:"Submission successful",
 score: totalScore,
 totalQuestions: testQuestions.length
 })

 } catch (error) {
 logger.error("Submission error:", error)
 return NextResponse.json({ error:"Internal server error" }, { status: 500 })
 }
}
