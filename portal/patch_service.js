const fs = require('fs');
const file = './src/services/student.service.ts';
let content = fs.readFileSync(file, 'utf8');

// Ensure bcrypt is imported
if (!content.includes("import bcrypt")) {
    content = "import bcrypt from 'bcryptjs';\n" + content;
}

const match = content.match(/const password = generateStrongPassword\(12\);.*?return \{ \.\.\.result\.profile, emailSent \};\n\};/s);

if (match) {
    const replacement = `const password = generateStrongPassword(12);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Create User & Profile in Database natively (Firebase removed)
  const result = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        mustChangePassword: true,
        name
      }
    });

    const profile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        admissionId: admissionId || null,
        name,
        skills: []
      }
    });

    // 4. Queue Welcome Email
    await tx.emailQueue.create({
      data: {
        to: email,
        subject: "Welcome to Scorlo Training & Placement Portal",
        payload: JSON.stringify({ name, email, rawPassword: password }),
        status: "PENDING"
      }
    });

    return { user, profile };
  });

  return { ...result.profile, emailSent: true };
};`;
    content = content.replace(match[0], replacement);
    fs.writeFileSync(file, content);
    console.log("Patched student.service.ts");
} else {
    console.log("Failed to match student.service.ts");
}
