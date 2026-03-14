import { NextRequest, NextResponse } from"next/server";
import db from"@/lib/db";
import { authorize, AuthUser } from"@/lib/auth-middleware";

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ["ADMIN"]);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const settings = await db.systemSetting.findMany();
 return NextResponse.json(settings);
 } catch (error) {
 console.error("[SETTINGS_GET]", error);
 return NextResponse.json({ error:"Internal Error" }, { status: 500 });
 }
}

export async function PATCH(req: NextRequest) {
 const authResult = await authorize(req, ["ADMIN"]);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { settings } = body; // Array of { key: string, value: string, category: string }

 if (!Array.isArray(settings)) {
 return NextResponse.json({ error:"Invalid settings format" }, { status: 400 });
 }

 // Using transaction for bulk update/upsert
 const updates = await db.$transaction(
 settings.map((setting) =>
 db.systemSetting.upsert({
 where: { key: setting.key },
 update: { value: setting.value, category: setting.category },
 create: {
 key: setting.key,
 value: setting.value,
 category: setting.category
 },
 })
 )
 );

 return NextResponse.json(updates);
 } catch (error) {
 console.error("[SETTINGS_PATCH]", error);
 return NextResponse.json({ error:"Internal Error" }, { status: 500 });
 }
}

