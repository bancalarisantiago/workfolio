export type LoginFormValues = {
  email: string;
  password: string;
};

export type RecoveryFormValues = {
  email: string;
};

export type SignUpFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyCode: string;
  companyName?: string;
  countryCode?: string;
  defaultTimeZone?: string;
  industry?: string;
  billingEmail?: string;
  companyDescription?: string;
};
