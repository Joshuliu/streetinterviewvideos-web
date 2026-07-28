import { NewClientForm } from '@/components/crm/ClientForms';

export const dynamic = 'force-dynamic';

export default function NewClientPage() {
  return (
    <div className="max-w-md">
      <h1 className="font-display text-3xl mb-2">New Client</h1>
      <p className="text-sm text-[#9ca3af] mb-6">
        The client is a person: your point of contact, representing a brand or an agency. Each order carries the brand it&apos;s for.
      </p>
      <NewClientForm />
    </div>
  );
}
