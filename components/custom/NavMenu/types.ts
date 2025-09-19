export type NavMenuUser = {
  firstName?: string;
  lastName?: string;
  cuil?: string;
};

export type NavMenuProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user?: NavMenuUser | null;
};
