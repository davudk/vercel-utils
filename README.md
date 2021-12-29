
This library contains some commonly needed React utilities.

## Hooks

### useArray
```tsx
function TestComponent() {
  const { at, moveUp, moveDown, remove /* and more */ } = useArray<MyType>();

  return (
    ...
  )
}
```

### useAsync
```tsx
function TestComponent() {
  const { result, prevResult, loading, error, load } = useAsync<UserProfile>({
    load: async () => {
      const res = await fetch('/api/profile');
      return res.json();
    }
  }):

  useEffect(load, []);
  
  return (
    ...
  )
}
```

### useEffectSkipInitial
```tsx
function TestComponent(props: any) {
  const { name } = props;
  
  useEffectSkipInitial(() => {
    // this will not be executed on the initial value of `name`
    //   e.g. if name is initially "A" and then changed to "B",
    //     this block will only execute after it's changed to "B" and on subsequent changes/values.
  }, [name]);

  return (
    ...
  )
}
```

### useForceRender
```tsx
function TestComponent() {
  const forceRender = useForceRender();
  
  return (
    <div>
      <h1>{Math.random()}</h1>
      <button onClick={forceRender}>Rerender</button>
    </div>
  )
}
```

### useIsMounted
```tsx
function TestComponent() {
  const [someData, setSomeData] = useState<any>();
  const isMounted = useIsMounted();

  // Example 1 (run code BEFORE initial render)
  if (!isMounted()) {
    // before initial render
  }

  // Example 2 (run code IF still mounted)
  async function longRunningOperation() {
    const data = await ... // some async op

    if (isMounted()) { // check to see if it's still mounted to avoid updating an unmounted component
      setSomeData(data);
    }
  }

  return (
    <div>
      <h1>{Math.random()}</h1>
      <button onClick={forceRender}>Rerender</button>
    </div>
  )
}
```

### useMap
```tsx
function TestComponent() {
  const { get, set, size /* and more */ } = useMap();

  return (
    ...
  )
}
```

### useStorage
```tsx
function TestComponent() {
  const [username, setUsername] = useStorage('username', {
    type: 'localStorage', // or 'sessionStorage'
    defaultValue: ''
  });

  return (
    <input value={username} onChange={e => setUsername(e.target.value)} />
  )
}
```

### useStorageArray
```tsx
function TestComponent() {
  const { at, moveUp, moveDown, remove /* and more */ } = useStorageArray<string>('todoList', {
    type: 'localStorage', // or 'sessionStorage'
    defaultValue: ['Item 1', 'Item 2']
  });

  return (
    ...
  )
}
```

### useMap
```tsx
function TestComponent() {
  const { get, set, size /* and more */ } = useStorageMap<string, any>('someMapInLocalStorage', {
    type: 'localStorage', // or 'sessionStorage'
  });

  return (
    ...
  )
}
```

### useTimeout
```tsx
function TestComponent() {
  const [num, setNum] = useState<number>();
  const { running, start, restart, stop } = useTimeout({
    autoStart: true,
    delay: 2000,
    callback: () => setNum(Math.random()),
    repeat: true
  });

  return (
    <div>Random value: {num}</div>
  )
}
```

## Components

### AsyncRender
You can also set the `mode` prop to `"any"` or `"all"` (default) to determine how the fields are required.

```tsx
function TestComponent() {
  const profileLoader = useAsync<UserProfile>(...):
  useEffect(profileLoader.load, []);

  return (
    <AsyncRender control={profileLoader}>

      <AsyncRender.State result>
        <div>
          Hi, {profileLoader.result.username}!
        </div>
      </AsyncRender.State>

      <AsyncRender.State prevResult loading>
        <div className="pointer-events-none opacity-50">
          Hi, {profileLoader.prevResult.username}!
        </div>
      </AsyncRender.State>

      <AsyncRender.State prevResult={false} loading>
        <div>
          Loading...
        </div>
      </AsyncRender.State>

      <AsyncRender.State error>
        <div>
          There was an error while loading your profile, see below:
          <pre>
            {JSON.stringify(profileLoader.error, null, 4)}
          </pre>
        </div>
      </AsyncRender.State>

    </AsyncRender>
  )
}
```

### Also check out

See package [`use-between`](https://www.npmjs.com/package/use-between). It goes pretty well with the hooks in this package.