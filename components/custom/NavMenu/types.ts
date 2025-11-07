export type NavMenuUser = {
  firstName?: string | null;
  lastName?: string | null;
  cuil?: string | null;
};

export type NavMenuProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => Promise<void>;
  user?: NavMenuUser | null;
};
