import { FormBuilder } from "@/components/builders/FormBuilder";

export default async function FormBuilderPage({ params }: { params: Promise<{ wsId: string }> }) {
  const { wsId } = await params;
  return <FormBuilder wsId={wsId} />;
}
