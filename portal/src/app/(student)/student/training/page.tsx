
import { Metadata } from"next";
import TrainingPage from"@/modules/training/components/student-training-client";

export const metadata: Metadata = {
 title:"My Training - CDC Platform",
 description:"Track your training sessions and attendance.",
};

export default function Page() {
 return <TrainingPage />;
}
