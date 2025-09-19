# Workfolio

Workfolio is an Expo-powered mobile workspace for employers and their teams to keep every required document current. Employees can upload, review, and sign paperwork from their phones while managers track compliance in real time. The app provides a single source of truth for contracts, NDAs, certifications, and any other documentation employees must keep up to date.

## Why Workfolio

- **Centralised document hub** – Collect identification, contracts, certificates, and policy acknowledgements in one place.
- **Mobile-first signing** – Capture signatures directly inside the app so forms are never waiting on a printer or scanner.
- **Instant status tracking** – Surface which documents are missing, expiring soon, or ready for employer approval.
- **Team transparency** – Give both managers and employees a clear view of what is outstanding.

## Coming soon

- **People calendar** – Celebrate the team with shared visibility into birthdays, anniversaries, and important company events.
- **Renewal reminders** – Automated nudges when certifications or forms are about to lapse.
- **Role-based dashboards** – Tailored views for HR, managers, and individual contributors.

## Tech stack

- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- [NativeWind](https://www.nativewind.dev/) + Tailwind CSS utilities for styling
- [React Hook Form](https://react-hook-form.com/) with Zod validation for resilient forms
- TypeScript, React Native, and Hermes for fast, typed development

## Getting started

1. Install dependencies
   ```bash
   yarn install
   ```

2. Start the development server
   ```bash
   yarn start
   ```
   Press `i`, `a`, or `w` to launch the iOS simulator, Android emulator, or web preview respectively. Alternatively, scan the QR code with the Expo Go app on a physical device.

3. Lint the project
   ```bash
   yarn lint
   ```

If things get out of sync, run `yarn reset-project` to reinstall dependencies and clear Expo caches.

## Project layout

- `app/` – Expo Router screens (auth flows, tab groups, modals)
- `components/` – Shared UI building blocks
- `hooks/` – Reusable logic such as authentication state
- `constants/` – Theme tokens and configuration
- `global.css` & `tailwind.config.js` – NativeWind/Tailwind styling setup

## Contributing

1. Create a feature branch and keep pull requests focused.
2. Ensure `yarn lint` passes and manually test on every platform touched.
3. Describe changes clearly, including any new UX flows or configuration steps.

## License

This project is currently private and intended for internal use. Contact the maintainers before distributing or reusing the code.
