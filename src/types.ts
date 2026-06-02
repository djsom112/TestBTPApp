export interface BtpUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  origin: string; // e.g. "sap.ids" (Default SAP ID Service), "external-ias" (Custom Login), "azure-ad" (Enterprise)
  roleCollections: string[]; // Role collections assigned to this user
  active: boolean;
  department?: string;
}

export interface BtpScope {
  name: string; // e.g. "$XSAPPNAME.read", "$XSAPPNAME.admin"
  description: string;
}

export interface BtpRoleCollection {
  name: string; // e.g. "BTP_Admin", "BTP_Developer"
  description: string;
  scopes: string[]; // Scopes included in this collection
}

export interface TokenDecodeResult {
  header: any;
  payload: any;
  isXsuaa: boolean;
  signatureLengthBytes: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  text: string;
  timestamp: string;
}
