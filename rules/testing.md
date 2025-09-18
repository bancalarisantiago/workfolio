# TESTING

- Write **unit tests** using [Jest](https://jestjs.io/) and [React Native Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/).
- Use [Detox](https://wix.github.io/Detox/) for **end-to-end (E2E) integration tests** on real devices or emulators.
- Include **snapshot tests** to catch UI regressions during development.
- Use Expo’s official [Testing Tools](https://docs.expo.dev/workflow/testing/) to test across multiple environments and devices.

### ✅ Examples

```ts
// Basic unit test with React Native Testing Library
import { render } from '@testing-library/react-native'
import { Button } from '@/components/Button'

test('renders button with text', () => {
  const { getByText } = render(<Button title="Submit" />)
  expect(getByText('Submit')).toBeTruthy()
})
```

```ts
// Snapshot test
import { render } from '@testing-library/react-native'
import { Header } from '@/components/Header'

test('matches snapshot', () => {
  const { toJSON } = render(<Header title="Welcome" />)
  expect(toJSON()).toMatchSnapshot()
})
```

```ts
// Detox E2E test example
describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should log in successfully', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
```

> 💡 Keep your tests colocated with the components they test using `.test.tsx` or `.spec.tsx`. Mock API calls and use testIDs for critical elements in E2E flows.
