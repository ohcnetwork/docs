# Data fetching in CARE

## Introduction to `useQuery`

CARE uses a custom built hook ([`useQuery`](https://github.com/ohcnetwork/care_fe/blob/develop/src/Utils/request/useQuery.ts)) and a function ([`request`](https://github.com/ohcnetwork/care_fe/blob/develop/src/Utils/request/request.ts)) to fetch data from and communicate with the backend. These are built on top of [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

### Basic Usage

Let's see some examples to get to know how to use `useQuery`.

```jsx
export default function Page() {
  const { data, loading } = useQuery(routes.users.current);

  // `loading` is true if `useQuery` has made a request and is awaiting for response.
  if (loading) {
    return <Loading />;
  }

  // `data` is type-safe, inferred from the type provided in the route definition.
  return (
    <>
      <span>Name: {data.name}</span>
      <span>Email: {data.email}</span>
    </>
  );
}
```

The first argument for `useQuery` is the route definition, which contains the resource path, HTTP method, request and response body type.

```jsx
// example:
const routes = {
  users: {
    current: {
      path: "/api/v1/users/getcurrentuser/",
      method: "GET",
      TRes: Type<UserModel>(),
    }
  },
}
```

### Passing query parameters

Now lets say we want to pass some query parameters too maybe (example: `GET /example/?name=...`).

```jsx
export default function Component() {
  const { data } = useQuery(MedicineRoutes.search, {
    query: {
      search: "Hello world!",
      type: "GENERIC",
    },
  });

  return <MedicinesList items={data.results} />;
}
```

### Replacing path parameters with a value

Now let's say an API endpoint has a variable in the URL (example: `GET /example/{id}/items/`).

```jsx
export default function Component(props: { consultationId: string }) {
  const { data } = useQuery(MedicineRoutes.prescriptions.list, {
    pathParams: {
      consultation_external_id: props.consultationId,
    },
  });

  return <PrescriptionsList items={data.results} />;
}
```

Here `useQuery` will attempt to replace the `{consultation_external_id}` present in the route definition's path with the specified values in the `pathParams`.

```jsx
// route definition example
const MedicineRoutes = {
  prescriptions: {
    list: {
      path: "/api/v1/consultation/{consultation_external_id}/prescriptions/",
      method: "GET",
      TRes: Type<PaginatedResponse<Prescription>>(),
    }
  },
}
```

## Introduction to `useInfiniteQuery`

`useInfiniteQuery` is a custom hook built on top of `useQuery` for handling paginated API requests that support infinite scrolling or loading more data as needed. It facilitates fetching paginated data, managing the state of items, and ensuring that duplicate items are removed when fetching new pages of results.

### Basic Usage

Here’s an example of how to use `useInfiniteQuery` to fetch paginated data and load additional pages:

```jsx
export default function Page() {
  const { items, loading, fetchNextPage, hasMore } = useInfiniteQuery(
    MedicineRoutes.prescriptions.list,
    {
      deduplicateBy: (item) => item.id, // Deduplicate based on a unique identifier
    }
  );

  // Display a loading indicator while data is being fetched
  if (loading) {
    return <Loading />;
  }

  // Render the list of items
  return (
    <>
      <MedicinesList items={items} />

      {/* Button to load more data if there are more items to fetch */}
      {hasMore && <button onClick={fetchNextPage}>Load More</button>}
    </>
  );
}
```

In the example above:

- `items` is the list of fetched items that is updated as new pages of data are loaded.
- `loading` indicates whether a request is currently in progress.
- `fetchNextPage` is the function that triggers the loading of the next page.
- `hasMore` tells you if there are more items to load based on the total count of items and the length of the fetched items.

### Arguments

`useInfiniteQuery` accepts the following arguments:

1. **`route`** (required): A route definition that describes the API endpoint, HTTP method, and response structure, just like with `useQuery`. The route should expect a paginated response with the `PaginatedResponse<TItem>` structure.

   Example route definition:

   ```ts
   const MedicineRoutes = {
     prescriptions: {
       list: {
         path: "/api/v1/consultation/{consultation_external_id}/prescriptions/",
         method: "GET",
         TRes: Type<PaginatedResponse<Prescription>>(),
       },
     },
   };
   ```

2. **`options`**: An object that allows customization of the query. It includes the following properties:

   - **`deduplicateBy`**: **Required**. A function that extracts a unique identifier from each item to prevent duplicate items when new pages are loaded. This function ensures that items are only shown once, even if the same data appears in multiple pages.

   Example of passing options:

   ```ts
   const options = {
     deduplicateBy: (item) => item.id, // Deduplicate based on a unique identifier
   };
   ```

### Key Return Values

The `useInfiniteQuery` hook returns an object containing the following properties:

- **`items`**: An array of items fetched so far (combined from multiple pages). The array is updated as more data is loaded.
- **`loading`**: A boolean indicating if the request is in progress.
- **`fetchNextPage`**: A function to load the next page of results.
- **`refetch`**: A function to refetch the data (same as `useQuery`).
- **`totalCount`**: The total count of items available (e.g., in a paginated result).
- **`hasMore`**: A boolean indicating whether there are more items to load based on the total count and the current number of fetched items.

### Example of Paginated API Route

A typical paginated response from the API might look like this:

```json
{
  "results": [
    { "id": 1, "name": "Prescription 1" },
    { "id": 2, "name": "Prescription 2" }
  ],
  "count": 100
}
```

### Handling Pagination

`useInfiniteQuery` handles pagination by keeping track of the `offset` (the number of items already loaded) and appending new items as additional pages are fetched. The `fetchNextPage` function increments the offset to load the next set of results.

## Performing non-GET requests

Let's say we want to submit a form, here we can make use of `request`.

```jsx
export default function Component(props: { patientId: string }) {
  const [data, setData] = useState(...);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (validate(data)) {
      return;
    }

    setIsProcessing(true);
    const { res, errors } = await request(routes.consultation.create, {
      pathParams: { patient_id: props.patientId },
      body: data,
    });
    setIsProcessing(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      disabled={isProcessing}
    >
      ...
    </form>
  );
}
```
