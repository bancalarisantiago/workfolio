## STATE MANAGEMENT

- Prefer `useReducer` and React Context for shared or global state over multiple `useState` hooks.
- Use [`react-query`](https://tanstack.com/query/latest) for API data fetching, caching, and revalidation.
- For more complex state or cross-feature logic, use lightweight state managers like [Zustand](https://zustand-demo.pmnd.rs/) or [Redux Toolkit](https://redux-toolkit.js.org/).
- Handle navigation state and URL parameters with [`expo-linking`](https://docs.expo.dev/guides/linking/).

### ✅ Examples

```ts
// useReducer + Context example
const initialState = { count: 0 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 }
    default:
      return state
  }
}

const CounterContext = React.createContext(null)

export function CounterProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  )
}
```

```ts
// react-query usage
import { useQuery } from '@tanstack/react-query'

function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
  })
}
```

```ts
// Zustand example
import create from 'zustand'

const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}))
```

```ts
// expo-linking for handling URL parameters
import * as Linking from 'expo-linking'

const url = Linking.createURL('profile', {
  queryParams: { ref: 'email' },
})

// Result: yourapp://profile?ref=email
```

> 💡 Centralize your context providers near the root of the app and keep state slices focused and scoped to their purpose.
