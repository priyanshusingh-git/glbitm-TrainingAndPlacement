import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
  if (authResult instanceof NextResponse) return authResult;

  const testId = (await params).id;

  try {
    const body = await req.json();
    const { results } = body; // Array of { rollNo: string, marksObtained: number, remarks?: string }

    if (!Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // 1. Get all students from the DB to map rollNo -> studentId
    const rollNumbers = results.map(r => r.rollNo.toString().trim());
    const students = await prisma.studentProfile.findMany({
      where: {
        rollNo: { in: rollNumbers }
      },
      select: {
        id: true,
        rollNo: true
      }
    });

    const studentMap = new Map(students.map(s => [s.rollNo, s.id]));

    // 2. Prepare data for bulk upsert
    const validResults = results
      .filter(r => studentMap.has(r.rollNo.toString().trim()))
      .map(r => ({
        testId,
        studentId: studentMap.get(r.rollNo.toString().trim())!,
        marksObtained: parseFloat(r.marksObtained),
        remarks: r.remarks || null
      }));

    // 3. Perform upserts (Prisma doesn't have a true bulk upsert for all providers, so we loop or use createMany with skip)
    // For simplicity and to update existing marks, we do them in a transaction
    const operations = validResults.map(result => 
      prisma.testResult.upsert({
        where: {
          testId_studentId: {
            testId: result.testId,
            studentId: result.studentId
          }
        },
        update: {
          marksObtained: result.marksObtained,
          remarks: result.remarks
        },
        create: result
      })
    );

    await prisma.$transaction(operations);

    return NextResponse.json({
      success: true,
      processed: validResults.length,
      skipped: results.length - validResults.length,
      skippedRollNumbers: rollNumbers.filter(rn => !studentMap.has(rn))
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import results' }, { status: 500 });
  }
}
