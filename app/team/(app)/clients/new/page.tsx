import { NewClientForm } from '@/components/crm/ClientForms';

export const dynamic = 'force-dynamic';

export default function NewClientPage() {
  return (
    <div className="max-w-md">
      <h1 className="font-display text-3xl mb-2">New Client</h1>
      <p className="text-sm text-[#9ca3af] mb-6">
        The client is the paying company (for agencies, the agency itself). Brands go on the orders.
      </p>
      <NewClientForm />
    </div>
  );
}
