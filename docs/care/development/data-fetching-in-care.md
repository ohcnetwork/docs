# Data fetching in CARE

## Introduction

CARE uses [TanStack Query](https://tanstack.com/query/latest) for data fetching and state management.

### API Route Definitions

Routes are defined with their path, method, and types:

```tsx
const routes = {
  users: {
    current: {
      path: "/api/v1/users/getcurrentuser/",
      method: "GET",
      TRes: Type<UserModel>(), // Response type
    }
  },
}
```

### Basic Usage with useQuery

[→ TanStack Docs: useQuery Overview](https://tanstack.com/query/latest/docs/react/guides/queries)

```tsx
import { useQuery } from "@tanstack/react-query";
import request from "@/Utils/request/request";

export default function UserProfile() {
  const { data, isLoading } = useQuery({
    queryKey: [routes.users.current.path],
    queryFn: () => request(routes.users.current),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1>{data?.data?.name}</h1>
      <p>{data?.data?.email}</p>
    </div>
  );
}
```

### Passing Query Parameters

[→ TanStack Docs: Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys)

For URLs like `/api/v1/medicine/search/?search=Paracetamol`:

```tsx
function SearchMedicines() {
  const { data } = useQuery({
    queryKey: [routes.medicine.search.path, "Paracetamol"],
    queryFn: () => request(routes.medicine.search, {
      query: { search: "Paracetamol" }
    }),
    enabled: true, // Only run when needed
  });

  return <MedicinesList medicines={data?.data?.results} />;
}
```

### Using Path Parameters 

[→ TanStack Docs: Dynamic Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys#if-your-query-function-depends-on-a-variable-include-it-in-your-query-key)

For URLs like `/api/v1/consultation/123/prescriptions/`:

```tsx
function PrescriptionsList({ consultationId }: { consultationId: string }) {
  const { data } = useQuery({
    queryKey: [routes.prescriptions.list.path, consultationId],
    queryFn: () => request(routes.prescriptions.list, {
      pathParams: { consultation_id: consultationId }
    }),
  });

  return <List items={data?.data?.results} />;
}
```

## Mutations

[→ TanStack Docs: Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

For creating, updating or deleting data:

```tsx
function CreatePrescription() {
  const mutation = useMutation({
    mutationFn: (data: PrescriptionData) => 
      request(routes.prescriptions.create, { body: data }),
  });

  async function handleSubmit(data: PrescriptionData) {
    const result = await mutation.mutateAsync(data);
    if (result.res?.ok) {
      toast.success("Prescription created");
    }
  }

  return (
    <PrescriptionForm 
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
  );
}
```

## Common Patterns

### Dependent Queries

[→ TanStack Docs: Dependent Queries](https://tanstack.com/query/latest/docs/react/guides/dependent-queries)

When one query depends on another:

```tsx
function PatientDetails({ patientId }: { patientId: string }) {
  // Get patient data first
  const { data: patient } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => request(routes.patient.get, { 
      pathParams: { id: patientId } 
    }),
  });

  // Then get prescriptions using patient data
  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', patient?.data?.id],
    queryFn: () => request(routes.prescriptions.list, {
      pathParams: { patient_id: patient?.data?.id }
    }),
    enabled: Boolean(patient?.data?.id), // Only run if we have patient
  });

  return (/* ... */);
}
```

## Further Reading

For advanced features like:
- [Caching strategies](https://tanstack.com/query/latest/docs/react/guides/caching)
- [Optimistic updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Infinite queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
- [Prefetching](https://tanstack.com/query/latest/docs/react/guides/prefetching)
- [Parallel queries](https://tanstack.com/query/latest/docs/react/guides/parallel-queries)
- [Suspense mode](https://tanstack.com/query/latest/docs/react/guides/suspense)

See the [TanStack Query docs](https://tanstack.com/query/latest/docs/react/overview) for complete documentation.

## Legacy Hooks (Deprecated)

> **Note**: The following hooks are deprecated:
> - Use `useQuery` instead of `useTanStackQueryInstead`
> - Use `useMutation` instead of `useDeprecatedMutation`

These exist only for backward compatibility and will be removed in future versions.
