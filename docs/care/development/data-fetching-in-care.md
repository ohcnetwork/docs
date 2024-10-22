# Data fetching in CARE

## Introduction to `useQuery`

CARE uses a custom built hook ([`useQuery`](https://github.com/ohcnetwork/care_fe/blob/develop/src/Utils/request/useQuery.ts#L12)) and a function ([`request`](https://github.com/ohcnetwork/care_fe/blob/develop/src/Utils/request/request.ts#L19)) to fetch data from and communicate with the backend. These are built on top of [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

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
    }
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
