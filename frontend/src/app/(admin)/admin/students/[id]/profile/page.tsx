import ProfileClient from"@/app/(admin)/admin/students/[id]/profile/profile-client";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 return <ProfileClient id={id} />;
}
