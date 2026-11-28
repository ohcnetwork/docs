# Permission paths

Part of stage 3. For every flow you document who can do it. The answer is a path, not a single permission.

## Why a path

To perform an action, a user must first get to it. They sign in, they belong to the facility, the menu item is shown to them, the page loads its data, the button is there, the form's pickers load their options, and only then does the save call ask the backend for the action permission. Each of those can depend on a different permission. A user who holds the action permission and lacks one of the earlier ones never sees the button.

Earlier pages listed only the last permission. The team's feedback was that this is not enough: to edit something a user must also be able to list and open it, and the frontend may ask for more before it shows the action at all. So for each flow you trace every gate from sign-in to save, and you record where each permission must be held and under what conditions.

The backend alone is also not enough of an answer. On 20 November 2026 the Workspaces permission file said that Admin and Facility Admin hold "Can Create/Update Workspaces". The viewset said more: an instance-wide workspace can be created only by a superuser, a facility workspace needs the permission in the facility's root organization, and a personal workspace can be updated only by the person who created it. A table copied from the permission file would have been wrong for three of the four kinds of workspace. This is an example of what to look for. Do not reuse it; read the code at your pin.

## The gates

Trace them in this order, the order the user meets them. For each one, record a fact with evidence. Frontend paths below are inside `care_fe`. Backend paths are written from `$S/src`, as in `research.md`.

| # | Gate | Where to look | What to record |
| --- | --- | --- | --- |
| 1 | Sign-in type | Route guards: `beforeLoad` on the route file and on each parent layout route; shared guards in `src/lib/router/auth.ts` | Staff, patient or public |
| 2 | Reaching the place | How the user gets into the facility, organization, patient or encounter the screen belongs to, and what lists them | Membership or permission needed to be there at all |
| 3 | Navigation | `src/components/ui/sidebar/`: the entry, and any condition on it | The condition, or that there is none |
| 4 | Route | `beforeLoad` redirects or checks on the route itself | The condition |
| 5 | Page load | Every query the page and its components run on load | The endpoint of each, and what that endpoint requires to list or read |
| 6 | The control | The condition under which the button, menu item or row action is rendered and enabled | Permission flags, record status, configuration |
| 7 | Inside the form | Pickers and lookups that load options | The endpoint of each and what it requires |
| 8 | Save | The mutation, its endpoint, and the viewset's authorization for that action | The permission, where it must be held, object conditions |

Gates 5 and 7 are the ones that get missed. To edit something you must be able to open it, and to open it you must be able to list it. If a form makes you choose a department, you must be allowed to list departments.

## Tracing a frontend call to its permission

1. In the component, find the call and the API definition it uses, then read the path and method in the `*Api.ts` file.
2. In `care/config/api_router.py`, find the viewset registered for that path.
3. In the viewset, find the authorization for that action:
   - create, update, delete: `authorize_create`, `authorize_update`, `authorize_destroy`
   - list and read: `get_queryset`, which usually filters to what the user may see, and any `authorize_retrieve`
   - custom endpoints: the `@action` method itself, which often checks inline
   - checks inherited from a base class in `care/care/emr/api/viewsets/base.py`
4. Each check calls `AuthorizationController.call("<name>", ...)`. Find `def <name>` under `care/care/security/authorization/`.
5. Read the handler. It names the permission (`SomePermissions.can_x.name`) and passes it to a shared check in `care/care/security/authorization/base.py`. Read that shared check too: its arguments decide where the permission must be held.
6. Read the permission in `care/care/security/permissions/`: its display name and its roles. A role list can be a constant defined higher in the file; expand it. Take role display names from `care/care/security/roles/role.py`.

```bash
grep -rn "def <handler_name>" care/care/security/authorization/
grep -n -A8 "<permission_slug> = " care/care/security/permissions/<domain>.py
```

Read the whole method each time, not just the matching line. The conditions that matter are in the branches.

## What to watch for

These patterns occur in Care. Whether each applies to your module is something to read at your pin, not assume.

- **Where a permission must be held.** A permission is held through a role in an organization. A shared check can require that organization to be a specific one, any organization of the facility, or the facility's root organization. "Holds the permission" and "holds it in the right place" are different things, and the page must say which.
- **Superuser.** Some branches allow only a superuser, and no role grants that. That action is out of the pages: a superuser is not a reader. Leave it out of the plan rather than writing "superusers only". Superusers also pass most other checks, so a check you traced for an ordinary user can look open when you test as a superuser. Probe with a user who holds the role, not with a superuser.
- **Object conditions.** Only the creator may update. Only while the record has a certain status. Only if not already linked. These are part of who can do it.
- **Borrowed permissions.** Many clinical resources have no permissions of their own and are governed by patient or encounter permissions. The permission to cite is the one the handler checks, whatever the resource is called.
- **Unused permissions.** A permission file can define permissions that no viewset checks. Never list a permission because it exists; list it because a gate checks it.
- **Frontend object permissions.** `hasPermission(permission, objectPermissions)` looks only in the list it is given when one is passed, for example the permissions that came with the facility. Note which list each check uses.
- **Frontend and backend disagreeing.** The frontend hides a button the backend would allow, or shows one the backend refuses. Record both sides. The page describes what the backend does. Do not ask which side to document. File the disagreement only when `issues.md` says it is a certain defect and the user has agreed.
- **Two roles, one name.** More than one default role can have the same display name in different contexts. When you name a role, make sure the reader can tell which.
- **Custom roles.** If the pinned version lets administrators create or edit roles, the role lists in the code are defaults. Then write "by default, the Doctor and Nurse roles hold this permission".
- **Parent records load first.** A screen inside a record also loads the record it belongs to, and that read has its own rule. On 28 November 2026 the encounter page loaded the patient as well as the encounter, and showed only its loading state until both arrived. The patient read had its own rule, separate from the encounter's: one permission through a role on the patient, or another in one of the patient's organizations. A closed encounter gave no role on the patient. Three reviewed drafts had missed this gate. Trace the parent read of every screen as part of gate 5.

## Recording a path

Add one block per flow to `facts.md`, after the facts it refers to. When a flow has variants with different paths, write one block per variant.

```markdown
## Path: Create a workspace (for a facility)

| # | Gate | Requirement | Held where / condition | Evidence |
| --- | --- | --- | --- | --- |
| 1 | Sign-in | Staff account | | E31 |
| 3 | Navigation | Facility settings is shown when ... | | E32, E33 |
| 5 | Page load | List workspaces: "Can Read Workspaces" | In an organization the workspace is shared with | E34, E35 |
| 8 | Save | "Can Create/Update Workspaces" | In the facility's root organization | E36, E37, E38 |

To reach the screen: ...
For the action: ...
Default roles that satisfy every gate: ...
Not settled: Q4 (gate 2)
```

Leave a gate out only when you have evidence that it does not apply, and say so. A gate you could not trace stays in the table as "not settled" with a question number.

Be careful with "roles that satisfy every gate". You can name them only when every gate is evaluated in the same place for the same user. When gates are held in different places, list what is needed at each and stop there.

## How this appears in a page

The flow template has a Permissions table with two columns, Permission and Access. Fill it like this:

- One row per permission on the path. Put the action permission first, then the permissions needed to reach it.
- Use the display name from the permission definition, never the slug.
- In Access, say in plain words what the permission lets the reader do in this flow, where it must be held when that matters, and which default roles hold it.
- State conditions that are not permissions as prerequisites, in the reader's terms: "You created the workspace."

A reader should be able to hand the table to their administrator and get exactly the access they need.

## Confirming at runtime

Static tracing of what a React page loads is error-prone: hooks nest, and queries are enabled by conditions. Recording gives you ground truth. Every flow recording writes `<flow>.api.json`, the list of API calls the flow really made with their status codes. See `media.md`.

After a recording:

1. Compare the calls with gates 5, 7 and 8 of your path. A call you did not trace is a gate you missed: trace it now. A call you predicted that never happened means your reading of the page was wrong: correct the path.
2. Any 403 in the log is a finding. Either the account lacked a permission the path should list, or the frontend calls something the user may not use.
3. Add the log as runtime evidence for the path.

On a disposable environment, with the user's agreement, you can go further and prove the path:

1. Create a role holding exactly the permissions on the path, and a user with that role in the places the path names.
2. Record the flow as that user. It must succeed.
3. Remove one permission at a time and try again. Each removal must stop the flow at the gate the path predicts.

Mark a path that passed as confirmed by execution, with the commit and date, in `facts.md` and in the pull request. Do this for the flows where a wrong answer costs most, typically create and edit. It is slow, so agree with the user which flows get it.
