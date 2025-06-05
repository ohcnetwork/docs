# Care Enhancement Proposal (CEP): Offline Support Implementation

## Overview

This proposal details the implementation of offline capabilities in CARE using **TanStack Query with IndexedDB persistence**. The solution enables healthcare workers to perform critical operations during internet outages with automatic synchronization when connectivity is restored.

We evaluated multiple methods to achieve this functionality. Information about these alternative approaches is documented in:  
[Additional Approaches Audit](./docs/care/offline-support-project/OfflineSupport.md)

The current proposal focuses specifically on our selected production-ready solution. Comprehensive implementation details for the chosen approach will be maintained in this document.

The implementation will focus on supporting specific critical workflows that require offline functionality. All workflows designated for offline support are documented in: [Additional Info Audit](./docs/care/offline-support-project/OfflineSupport.md)

## Implementation Phases

1. **[Phase 1: Caching ](#phase-1-caching)**
2. **[Phase 2: Offline Writes](#phase-2-offline-writes)**
3. **[Phase 3: Synchronization](#phase-3-synchronization)**
4. **[Phase 4: Notifications](#phase-4-notifications)**

### Phase 1: Caching

Phase 1 will include adding caching logic in Care for the workflows(mention in [Additional Info Audit](./docs/care/offline-support-project/OfflineSupport.md)) so that data will be cached locally and avaible when ofline.

### Scope

- **Primary Focus**: API response caching for offline-supported workflows
- **Secondary**: Asset caching (handled automatically via PWA capabilities)
- **Selective Caching**: Only endpoints marked with `meta.persist` will be cached

**Note**: Configuration details needed for caching using tanstack query are available in [Additional Approaches Audit](./docs/care/offline-support-project/OfflineSupport.md). This section focuses on their technical implementation.

### Technical Design:

#### 1. Persistence Implementation

We will implement a custom persister using **IndexedDB** for local data storage, with **Dexie.js** as our wrapper library for simplified IndexedDB operations.

**Database Schema Definition**:

```typescript
export class AppCacheDB extends Dexie {
  queryCache!: Dexie.Table<
    {
      cacheKey: string;
      data: unknown;
      timestamp: number;
    },
    string
  >;

  constructor() {
    super("AppQueryCache");
    this.version(1).stores({
      queryCache: "cacheKey, timestamp",
    });
  }
}
```

**createUserPersister funtion** : It create a custom persister function that handles IndexedDB operations via Dexie.js. It will passed in persistOptions in the `PersistQueryClientProvider`. This persister will implement three core methods required by TanStack Query:

- `persistClient`: Saves the current query cache state
- `restoreClient`: Retrieves cached data when offline
- `removeClient`: Clears cached data (e.g., on logout)

```typescript
export const createUserPersister = () => {
  const db = new AppCacheDB();
  const CACHE_KEY = `REACT_QUERY`;

  return {
    async persistClient(client: unknown) {
      await db.queryCache.put({
        cacheKey: CACHE_KEY,
        data: client,
        timestamp: Date.now(),
      });
    },

    async restoreClient(): Promise<PersistedClient | undefined> {
      try {
        const entry = await db.queryCache.get(CACHE_KEY);
        return entry?.data as PersistedClient;
      } catch {
        return undefined;
      }
    },

    async removeClient() {
      await db.queryCache.delete(CACHE_KEY);
    },
  } satisfies PersistQueryClientOptions["persister"];
};
```

**PersistQueryClientProvider**: We'll wrap our application with the `PersistQueryClientProvider` to enable offline persistence. This requires:

1. QueryClient Configuration:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,
    },
  },
});
```

2. PersistQueryClientProvider

```typescript
<PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: createUserPersister(),
          maxAge: 1000 * 60 * 60 * 24 * 7,
          dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
        Boolean(query.meta?.persist)
    }
  }}
        }}
      >
</PersistQueryClientProvider>
```

#### Configuration Notes:

- `gcTime` (Garbage Collection Time) Duration queries stay cached in memory (default: 5 minutes). It will set using `env` .

- `maxAge` How long persisted data remains valid in storage. It Must be ≤ `gcTime` .It will set using `env`.

- `shouldDehydrateQuery: (query) =>
    Boolean(query.meta?.persist)` Filters only those queries which have meta.persist `true`.It ensure only those query will store locally which we want . Its because we have to cache data for specfic workflows only.

**useQuery configuration**: In all the `usequery` of the discussed workflows will be updated with `networkMode: "online"` and `meta: {persist: true}` in their config.

- `networkMode: "online"` ensures the query will execute only when online. When offline, the query will not execute and cached data will be shown.

  > **Note**: Tanstack use their Onlinemanger.online() for network status which sometime can give false positive's. for eg . wifi but no internet access
  
- `meta: { persist: true }` helps to dehydrate only those APIs that have `persist: true`, preventing excessive storage usage.

API data is cached per `queryKey`. When fetching fresh data with the same `queryKey`, the cached data will automatically update with the new response in both:

- In-memory cache
- Persistent local storage (IndexedDB)

```typescript
const { data: user, isLoading } = useQuery({
  queryKey: ["currentUser", accessToken],
  queryFn: query(routes.currentUser, { silent: true }),
  networkMode: "online",
  retry: false,
  enabled: !!localStorage.getItem(LocalStorageKeys.accessToken),
  meta: { persist: true },
});
```

#### Important Cache Behavior Notes

- **`User Session Isolation`**

  - Cache data is cleared during logout/session expiration
  - Prevents one user's data from mixing with another's
  - Consequence: Offline access unavailable after logout

- **`Dynamic Data Availability`**
  - Only data fetched while online is cached for offline use
  - Example:
    - Patient1 (accessed online) → Available offline
    - Patient2 (not accessed) → Unavailable offline

### Phase 2: Offline Writes

This phase implements saving form data to IndexedDB (via Dexie.js) when offline, for later synchronization when connectivity returns.

**Implementation Flow**:

1. On form submission, check network status
2. If offline:
   - Save form data to IndexedDB
   - Queue for later synchronization
3. If online:
   - Process normally via `useMutation`

#### 1. Dexie.js Table Schema

so first see the table schema and then we will discusse about each entrie of the table schema. we will use same indexdDB database instant we use for caching. W just create another Table in it for offline writes.

```ts
offlineWrites!: Dexie.Table<
    {
      id: string;
      userId: string;
      syncrouteKey: string;
      resourceType?: string;
      pathParams?: Record<string, any>;
      payload: unknown;
      clientTimestamp: number;
      serverTimestamp?: string;
      lastAttemptAt?: number;
      syncStatus: "pending" | "success" | "failed" | "conflict";
      lastError?: string;
      retries?: number;
      conflictData?: unknown;
      queryrouteKey?: string;
      queryParams?: Record<string, any>;
    },
    string
  >;
 constructor() {
   this.version(2).stores({
      queryCache: "cacheKey, timestamp",
      offlineWrites: "id, userId,  timestamp",
    });
 }
```

Below is a concise description of each field in the offlineWrites Dexie table :-

1. **`id: string`** :- Unique identifier for this offline‑write record (usually a UUID).
2. **`userId: string`** :- The ID of the current user (e.g. `user.external_id`) who initiated this write. Help to prevent syncing data of one user by another user if there is same device.
3. **`syncrouteKey: string`** :- Key/name of the mutation route to replay when syncing (e.g. `"updatePatient"`), allowing reuse of existing mutation functions.
4. **`resourceType?: string`** :- Human‑readable tag for the type of resource being written (e.g. `"patient"`, `"form"`), useful for grouping or logging.
5. **`pathParams?: Record<string, any>`** :- Route parameters (e.g. `{ id: patientId }`) required by the `syncrouteKey` mutation, so the same API function signature can be called offline.
6. **`payload: unknown`** :- The actual data object (e.g. updated form fields) that will be sent to the server when back online.
7. **`clientTimestamp: number`** :- Timestamp (e.g. `Date.now()`) when the user saved this record offline—used to order writes or detect staleness.
8. **`serverTimestamp?: string`** :- Optional server‑provided timestamp of the last known server version (e.g. `patientQuery.data.modified_date`) for conflict detection at frontend level.
9. **`lastAttemptAt?: number`** :- Timestamp of the last time you tried syncing this record—used to implement retry/backoff logic.
10. **`syncStatus: "pending" | "success" | "failed" | "conflict"`** :- Current sync state:
    - `"pending"` = not yet retried
    - `"success"` = synced successfully
    - `"failed"` = last sync attempt errored
    - `"conflict"` = server data has diverged from local payload
11. **`lastError?: string`** :- Error message (e.g. HTTP status or validation error) from the most recent sync attempt, for debugging or user notification.
12. **`retries?: number`** :- Number of times this record has been retried so far—used to limit retry attempts or escalate conflicts.
13. **`conflictData?: unknown`** :- If a conflict is detected (e.g. server has newer data), this holds the server’s latest version so you can show a merge UI.
14. **`queryrouteKey?: string`** :- Key/name of the “fetch” route (e.g. `"getPatient"`) that can be called before syncing, in order to retrieve the current server state for conflict checks.
15. **`queryParams?: Record<string, any>`** :- Route parameters (e.g. `{ id: patientId }`) required by `queryrouteKey` to fetch the current form/patient data before submitting the offline write.

#### 2. **SaveofflineWrites** function

We have a generalized `saveOfflineWrites` function that should be called when submitting form data while offline. We will pass all necessary information to it so that it can save the data locally in IndexedDB.

```ts
export const saveOfflineWrite = async ({
  userId,
  syncrouteKey,
  payload,
  pathParams,
  resourceType,
  serverTimestamp,
  queryParams,
  queryrouteKey,
}: SaveOfflineWriteParams) => {
  const writeEntry = {
    id: uuidv4(),
    userId,
    syncrouteKey,
    payload,
    pathParams,
    resourceType,
    clientTimestamp: Date.now(),
    serverTimestamp,
    syncStatus: "pending" as const,
    retries: 0,
    queryParams,
    queryrouteKey,
  };

  try {
    await db.offlineWrites.add(writeEntry);
    console.log("Offline write saved successfully:", writeEntry);
  } catch (error) {
    console.error(" Failed to save offline write:", error);
  }
};
```

> Note : Here again a critical point that is using navigator.online or tanstack network provider for checking network status, both can sometime giving wrong network status value in some cases.

### Phase 3: Synchronization

Now this is one of the important phase of offline support functionality. Here we will synchronize the data that we save during offline. so for that we need a sync manage . A production‑grade sync manager should include:

#### 1. fetching pending writes (`getPendingWrites`)
- Use `getPendingAndRetryableWrites(userId)` to retrieve all records where syncStatus is either "pending" or "failed" (with retries < MAX_RETRIES).

```ts
export async function getPendingAndRetryableWrites(
  userId: string
): Promise<OfflineWriteRecord[]> {
  return db.offlineWrites
    .where("userId")
    .equals(userId)
    .and((w) => {
      const isPending = w.syncStatus === "pending";
      const isFailedButRetryable =
        w.syncStatus === "failed" && (w.retries || 0) < MAX_RETRIES;
      return isPending || isFailedButRetryable;
    })
    .toArray();
}
```

#### 2. Processing each write (`syncOneWrite`) with proper error/409 handling and Retry/backoff logic (`shouldRetry`, `computeBackoffDelay`, scheduleRetry).
- For every item in that list, call `syncOneWrite(write)`, which:
 Runs conflict detection first (`detectAndMarkConflict`). If the server’s `modified_date` differs from the cached `serverTimestamp`, it immediately marks that record as "conflict" and skips any further mutation.
-  If no `conflict`, attempts the API mutation `(mutate(route, payload))`.
- On success, updates syncStatus = "success" and timestamps the write.
  • On error: If HTTP 409, marks `syncStatus = "conflict"` and stores the server’s data in conflictData. Otherwise, marks syncStatus = "failed", increments retries, saves the error message, and—if `retries < MAX_RETRIES—schedules` a retry via `computeBackoffDelay(retries) + scheduleRetry`.

```ts
export async function syncOneWrite(write: OfflineWriteRecord): Promise<void> {
  const now = Date.now();

  // 1) Detect (and mark) conflict up front
  const didConflict = await detectAndMarkConflict(write);
  if (didConflict) {
    return;
  }

  try {
    // 2) Execute the mutation route
    const route = offlineRoutes[write.syncrouteKey as OfflineRouteKey];
    const mutationFn = mutate(route, { pathParams: write.pathParams as any });
    await mutationFn(write.payload);

    // 3) On success, mark as synced
    await db.offlineWrites.update(write.id, {
      syncStatus: "success",
      lastAttemptAt: now,
    });

    toast.success(`Sync succeeded for write ${write.id}`);
  } catch (error: any) {
    const nextRetries = (write.retries || 0) + 1;
    const isConflict = error?.response?.status === 409;

    const updateFields: Partial<OfflineWriteRecord> = {
      lastAttemptAt: now,
      retries: nextRetries,
      lastError: error?.message || "Unknown error",
    };

    if (isConflict) {
      // 4.a) On HTTP 409, mark as conflict
      updateFields.syncStatus = "conflict";
      updateFields.conflictData = error.response?.data;
    } else {
      // 4.b) On other errors, mark as failed
      updateFields.syncStatus = "failed";
    }

    await db.offlineWrites.update(write.id, updateFields);
    toast.error(`Sync failed for write ${write.id}: ${updateFields.lastError}`);

    // 5) Retry/backoff logic (only for non-conflict)
    if (!isConflict && shouldRetry(nextRetries)) {
      const delay = computeBackoffDelay(nextRetries);
      scheduleRetry(write.userId, delay);
    }
  }
}

export function shouldRetry(currentRetries: number): boolean {
  return currentRetries < MAX_RETRIES;
}

export function computeBackoffDelay(attempt: number): number {
  return BASE_BACKOFF_MS * 2 ** (attempt - 1);
}

export function scheduleRetry(userId: string, delayMs: number): void {
  setTimeout(() => {
    processSyncQueue(userId);
  }, delayMs);
}
```

#### 3. Conflict detection & resolution (`detectAndMarkConflict`) :- If server’s modified_date has changed since we cached it, that’s a conflict.
-  `detectAndMarkConflict`(write) fetches the current server record (using queryrouteKey/queryParams) and compares `serverData.modified_date` with `write.serverTimestamp`.
-  If they differ, it updates that write’s `syncStatus = "conflict"` and saves conflictData so the UI can prompt the user.
```ts
async function detectAndMarkConflict(
  write: OfflineWriteRecord
): Promise<boolean> {
  if (!write.queryrouteKey || !write.queryParams) {
    return false;
  }

  try {
    const fetchFn = query(
      offlineRoutes[write.queryrouteKey as OfflineRouteKey]
    );
    const serverData = await fetchFn({ pathParams: write.queryParams as any });

    if (serverData.modified_date !== write.serverTimestamp) {
      await db.offlineWrites.update(write.id, {
        syncStatus: "conflict",
        conflictData: serverData,
        lastAttemptAt: Date.now(),
      });
      return true;
    }
  } catch (err) {
    console.warn(`detectAndMarkConflict: failed for write ${write.id}`, err);
  }

  return false;
}
```

#### 4. Queue orchestration (`processSyncQueue`) triggered by network or timed events.
- `processSyncQueue(userId)` is triggered whenever the browser fires "online" (via onNetworkStatusChange) .
-  Each pass fetches the current pending/retryable writes and calls syncOneWrite on each in series.
```ts
export async function processSyncQueue(userId: string): Promise<void> {
  if (!navigator.onLine || !userId) return;

  const writesToProcess = await getPendingAndRetryableWrites(userId);

  for (const write of writesToProcess) {
    await syncOneWrite(write);
  }
}
```

#### 5. cleanup (`cleanupSuccessfulWrites`).
- `cleanupSuccessfulWrites(userId, olderThanMs)` deletes any records where `syncStatus === "success"` and `clientTimestamp < Date.now() − olderThanMs` preventing the offline‐write table from growing indefinitely.

```ts
export async function cleanupSuccessfulWrites(
  userId: string,
  olderThanMs: number
): Promise<void> {
  const cutoff = Date.now() - olderThanMs;
  await db.offlineWrites
    .where("userId")
    .equals(userId)
    .and((w) => w.syncStatus === "success" && w.clientTimestamp < cutoff)
    .delete();
}
```

#### 6. Event listeners (`onNetworkStatusChange`).
- `onNetworkStatusChange(userId)` listens for window.addEventListener("online") and calls processSyncQueue(userId) immediately when connectivity returns.
> Note : We can also have `periodicsync` that try o sync data after specific intervel. But for now we are just syncing on only on network status change.

```ts
export function onNetworkStatusChange(userId: string): void {
  window.addEventListener("online", () => {
    processSyncQueue(userId);
  });
}
```

### Phase 4: Notifications










## Limitations and Known Issues

Before discussing limitation and known Issue , let say go through how CARE work offline :

- User logged-in  and run website, Whenever user go throught he workflows for which offline functionality is added there API-data will caached and save locally
- now suppose user goes offline( during Active session), Now it will can access those pages and data that is present in cache or user previosly visit.
- now if user fill forms , it will be saved offline if navigator.online==false(means we are offline).
- Now when network status switch to online , syncing start and all our data will be sync to backend.
- user can see their conflict and faild data in notification part.

Now lets take a look om limitation and known issue now :
 
 - **Reliance on navigator.onLine** : Browsers often report “online” when a device is connected to a local network but actually has no Internet access (e.g. captive portals or firewalls). This can cause the sync manager to attempt writes even though the server is unreachable
 - **No Background Sync Outside Active Tab**: All synchronization occurs only while the app is open and the user is logged-in. If the user closes the tab or the device sleeps, pending writes remain unsynced until the app is re‐opened.
- **Conflict Resolution Assumes Timestamp Accuracy**: We rely on comparing serverData.modified_date to write.serverTimestamp. If the server’s clock drifts or the timestamp field is not updated reliably, conflicts may be missed or falsely detected.
- **No offline support after Log-out**: when a user logout , its cached data will be cleared and it cannot access website offline. But clearing cache during logout increase security and also prevent mixing of data of two or more user if their is same device.
- **No child offline write until parent offline write syncs**: In many cases, a user should not be able to save a child record offline if it depends on a parent record that has not yet been synced. For example, after saving an offline write to create a patient, you cannot save an offline write for an encounter of that patient until the “create-patient” write has successfully synced. 
> Note : For some simple cases we can handle dependency enforcement  of  data during online. Simply means for those child write that not depend heavily on parent record.


## Implemenation Timeline and Milestone

As project implementation is divided into four phases , we  will  complete phase 1-2  from week 1-6 (till mid evaluation) and  phase 3-4 from week 7-12. 

| **Phase**               | **Timeline**      | **Key Deliverables**                                                                 |
|-------------------------|-------------------|-------------------------------------------------------------------------------------|
| **Phase 1: Caching**    | Week 1 – Week 3   | • Dexie schema & IndexedDB setup<br>• `PersistQueryClientProvider` integrated<br>• Selective caching (`meta.persist`) verified<br>• Implementation of all tech config mention in phase 1<br>• Offline reads tested |
| **Phase 2: Offline Writes**(mid-evaluation) | Week 4 – Week 6 | • `offlineWrites` table created<br>• `saveOfflineWrite` hooked into forms|
| **Phase 3: Synchronization** | Week 7 – Week 9 | • `syncOneWrite`, retry/backoff, and `computeBackoffDelay` complete<br>• `detectAndMarkConflict` implemented<br>• Implementation of all tech config mention in phase 3<br>• End-to-end sync (offline → online) tested |
| **Phase 4: Notifications** | Week 10 – Week 12 | • Conflict notification event/UI built<br>• `resolveConflict` helper added<br>•Optimization & Performance<br>•User Testing & Documentation
