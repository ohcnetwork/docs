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
    },
  },
};
```

### Basic Usage with useQuery

[→ TanStack Docs: useQuery Overview](https://tanstack.com/query/latest/docs/react/guides/queries)

```tsx
import { useQuery } from "@tanstack/react-query";
import query from "@/Utils/request/query";

export default function UserProfile() {
  const { data, isLoading } = useQuery({
    queryKey: [routes.users.current.path],
    queryFn: query(routes.users.current),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
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
    queryFn: query(routes.medicine.search, {
      queryParams: { search: "Paracetamol" },
    }),
    enabled: true,
  });

  return <MedicinesList medicines={data?.results} />;
}
```

### Using Path Parameters

[→ TanStack Docs: Dynamic Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys#if-your-query-function-depends-on-a-variable-include-it-in-your-query-key)

For URLs like `/api/v1/consultation/123/prescriptions/`:

```tsx
function PrescriptionsList({ consultationId }: { consultationId: string }) {
  const { data } = useQuery({
    queryKey: [routes.prescriptions.list.path, consultationId],
    queryFn: query(routes.prescriptions.list, {
      pathParams: { consultation_id: consultationId },
    }),
  });

  return <List items={data?.results} />;
}
```

### Using Request Body

While `useQuery` is typically used for GET requests, it can also handle POST requests that are semantically queries (like search operations):

```tsx
function SearchPatients() {
  const { data } = useQuery({
    queryKey: ["patients", "search", searchTerm],
    queryFn: query(routes.patients.search, {
      body: {
        search_text: searchTerm,
        filters: {
          district: selectedDistrict,
          status: "Active",
        },
      },
    }),
    enabled: Boolean(searchTerm),
  });

  return <PatientsList patients={data?.results} />;
}
```

Note: For mutations (creating, updating, or deleting data), use `useMutation` instead.

## Using useInfiniteQuery

[→ TanStack Docs: useInfiniteQuery](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)

For paginated data fetching, use `useInfiniteQuery`. It supports loading additional data as the user scrolls or interacts.

### Example:

```tsx
import { useInfiniteQuery } from "@tanstack/react-query";
import query from "@/Utils/request/query";

function PaginatedList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [routes.items.list.path],
      queryFn: ({ pageParam = 1 }) =>
        query(routes.items.list, {
          queryParams: { page: pageParam },
        }),
      getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    });

  return (
    <div>
      {data?.pages.map((page, index) => (
        <Fragment key={index}>
          {page.results.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </Fragment>
      ))}
      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? "Loading..."
          : hasNextPage
          ? "Load More"
          : "No More Items"}
      </button>
    </div>
  );
}
```

### Key Points:

- queryFn: Fetches data based on the current page.
- getNextPageParam: Determines the next page number from the response.
- fetchNextPage: Loads the next page when called.
- Pagination Support: Handles infinite scrolling or user interactions seamlessly.

## Mutations

[→ TanStack Docs: Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

CARE provides a `mutate` utility function that works seamlessly with TanStack Query's `useMutation` hook for creating, updating, or deleting data:

```tsx
import { useMutation } from "@tanstack/react-query";
import mutate from "@/Utils/request/mutate";

function CreatePrescription({ consultationId }: { consultationId: string }) {
  const { mutate: createPrescription, isPending } = useMutation({
    mutationFn: mutate(routes.prescriptions.create, {
      pathParams: { consultationId },
    }),
    onSuccess: () => {
      toast.success("Prescription created successfully");
    },
  });

  return (
    <PrescriptionForm
      onSubmit={handleSubmit}
      isSubmitting={mutation.isPending}
    />
    <Button 
      onClick={() => createPrescription({ 
        medicineId: "123", 
        dosage: "1x daily" 
      })}
      disabled={isPending}
    >
      Create Prescription
    </Button>
  );
}
```

### Using Path Parameters with Mutations

For URLs that require path parameters, like `/api/v1/patients/123/update/`:

```tsx
function UpdatePatient({ patientId }: { patientId: string }) {
  const { mutate: updatePatient } = useMutation({
    mutationFn: mutate(routes.patients.update, {
      pathParams: { id: patientId },
      silent: true // Optional: suppress error notifications
    })
  });

  const handleSubmit = (data: PatientData) => {
    updatePatient(data);
  };

  return <PatientForm onSubmit={handleSubmit} />;
}
```

The `mutate` utility accepts configuration options similar to the `query` utility:
- `pathParams`: For URL parameters
- `queryParams`: For query string parameters
- `silent`: Optional boolean to suppress error notifications
- Additional request options as needed

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
>
> - Use `useQuery` instead of `useTanStackQueryInstead`
> - Use `useMutation` instead of `useDeprecatedMutation`

These exist only for backward compatibility and will be removed in future versions.
