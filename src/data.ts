import { BtpUser, BtpScope, BtpRoleCollection } from "./types";

export const INITIAL_SCOPES: BtpScope[] = [
  {
    name: "$XSAPPNAME.read",
    description: "Allows read-only access to Ledger records, Audit entries, and subaccount stats.",
  },
  {
    name: "$XSAPPNAME.write",
    description: "Allows creation, modification, and state transition of business documents.",
  },
  {
    name: "$XSAPPNAME.admin",
    description: "Full administrative access to secure properties and identity mapping configs.",
  },
];

export const INITIAL_ROLE_COLLECTIONS: BtpRoleCollection[] = [
  {
    name: "BTP_Admin",
    description: "Grants full administrative, reading, and writing capabilities on BTP Core resources.",
    scopes: ["$XSAPPNAME.read", "$XSAPPNAME.write", "$XSAPPNAME.admin"],
  },
  {
    name: "BTP_Developer",
    description: "Standard developer authorization mapping reading and editing capabilities.",
    scopes: ["$XSAPPNAME.read", "$XSAPPNAME.write"],
  },
  {
    name: "BTP_Viewer",
    description: "General viewing rights. Best assigned to business auditors.",
    scopes: ["$XSAPPNAME.read"],
  },
];

export const INITIAL_USERS: BtpUser[] = [
  {
    id: "u-3942-df4",
    username: "jane.doe@enterprise.com",
    email: "jane.doe@enterprise.com",
    firstName: "Jane",
    lastName: "Doe",
    origin: "azure-ad",
    roleCollections: ["BTP_Admin"],
    active: true,
    department: "Cloud Architecture",
  },
  {
    id: "u-2940-ab9",
    username: "john.dev@sap-service.com",
    email: "john.dev@sap-service.com",
    firstName: "John",
    lastName: "Smith",
    origin: "sap.ids",
    roleCollections: ["BTP_Developer", "BTP_Viewer"],
    active: true,
    department: "Enterprise Apps",
  },
  {
    id: "u-8593-cc4",
    username: "audit.bob@sap-service.com",
    email: "audit.bob@sap-service.com",
    firstName: "Bob",
    lastName: "Martin",
    origin: "external-ias",
    roleCollections: ["BTP_Viewer"],
    active: true,
    department: "Internal Audit",
  },
  {
    id: "u-2950-km1",
    username: "alice.cooper@partner.com",
    email: "alice.cooper@partner.com",
    firstName: "Alice",
    lastName: "Cooper",
    origin: "azure-ad",
    roleCollections: [],
    active: false,
    department: "External Integration",
  },
];

// Generates a mock BTP JWT token based on current user context, scopes, and attributes
export function generateMockBtpToken(user: BtpUser, scopes: string[], xsAppName: string = "btp-app-financials") {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: "btp-signing-key-default-v1",
    jku: `https://subaccount-uaa.authentication.us-east5.hana.ondemand.com/token_keys`
  };

  const nowUnix = Math.floor(Date.now() / 1000);
  const expUnix = nowUnix + 43200; // 12 hours validity

  // Map user dynamic role collection scopes
  const parsedScopes = scopes.map(s => s.replace("$XSAPPNAME", xsAppName));

  const payload = {
    jti: `jti-${Math.random().toString(36).substring(2, 10)}`,
    sub: user.id,
    user_id: user.id,
    user_name: user.username,
    email: user.email,
    given_name: user.firstName,
    family_name: user.lastName,
    name: `${user.firstName} ${user.lastName}`,
    origin: user.origin,
    ext_attr: {
      enhancement: "BTP-Identity",
      department: user.department || "General",
      subaccountId: "global-subaccount-9876-uuid"
    },
    "xs.system_attributes": {
      "xs.rolecollections": user.roleCollections
    },
    scope: parsedScopes,
    client_id: `sb-${xsAppName}!t1234`,
    cid: `sb-${xsAppName}!t1234`,
    azp: `sb-${xsAppName}!t1234`,
    grant_type: "authorization_code",
    rev_sig: "3a88cbf3",
    iat: nowUnix,
    exp: expUnix,
    iss: `https://subaccount-uaa.authentication.us-east5.hana.ondemand.com/oauth/token`,
    aud: [`sb-${xsAppName}!t1234`, xsAppName],
  };

  const base64UrlEncode = (obj: any) => {
    const str = JSON.stringify(obj);
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  };

  const headerB64 = base64UrlEncode(header);
  const payloadB64 = base64UrlEncode(payload);
  
  // Dummy signature
  const dummySignatureB64 = "TXZjR0NTRVlMbmRxUllQc21tOHpCcVVYTE9XSVlhbHBRdGRPTmYwUWp2V3Nld2pSdVd5MTloR3ByTEt3NlpEOTV4d3RzOW90OTZhc2Q4U1daZnpUWVFFVzEwMlBPeHVZMWQ0RkZHTGthYnNidlp3cTVyOWQ2ZmFzZGFzYTk4MTJhMTIzOVo="
    .substring(0, 86);

  return `${headerB64}.${payloadB64}.${dummySignatureB64}`;
}

// Config Files Generators
export function generateXsSecurityJson(scopes: BtpScope[], roleCollections: BtpRoleCollection[], xsAppName: string = "btp-app-financials") {
  const formattedScopes = scopes.map(s => ({
    name: s.name,
    description: s.description
  }));

  const formattedRoleTemplates = roleCollections.map(rc => ({
    name: rc.name + "Template",
    description: `Template containing privileges for ${rc.name}`,
    "scope-references": rc.scopes
  }));

  const formattedRoleCollections = roleCollections.map(rc => ({
    name: rc.name + "_Collection",
    description: rc.description,
    "role-template-references": [
      `$XSAPPNAME.${rc.name}Template`
    ]
  }));

  const xsSecurity = {
    xsappname: xsAppName,
    "tenant-mode": "shared",
    scopes: formattedScopes,
    "role-templates": formattedRoleTemplates,
    "role-collections": formattedRoleCollections
  };

  return JSON.stringify(xsSecurity, null, 2);
}

export function generateMtaYaml(xsAppName: string = "btp-app-financials") {
  return `_schema-version: "3.2"
ID: ${xsAppName}-project
version: 1.0.0
description: "Multi-Target Application for secure SAP BTP user directory app"

modules:
  - name: ${xsAppName}-backend
    type: nodejs
    path: backend
    provides:
      - name: backend-api
        properties:
          srv-url: \${default-url}
    requires:
      - name: ${xsAppName}-uaa

  - name: ${xsAppName}-approuter
    type: approuter
    path: approuter
    parameters:
      keepalive: true
    requires:
      - name: backend-api
        group: destinations
        properties:
          name: backend-api-dest
          url: ~{srv-url}
          forwardAuthToken: true
      - name: ${xsAppName}-uaa

resources:
  - name: ${xsAppName}-uaa
    type: org.cloudfoundry.managed-service
    parameters:
      service: xsuaa
      service-plan: application
      path: ./xs-security.json
`;
}

export function generateServerJs(xsAppName: string = "btp-app-financials") {
  return `/**
 * secure Node.js Express server configured for SAP BTP using @sap/xssec
 */
const express = require("express");
const xsenv = require("@sap/xsenv");
const xssec = require("@sap/xssec");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Load service configurations (such as XSUAA) automatically from BTP service binding env.
xsenv.loadEnv();

try {
  const xsuaaServices = xsenv.getServices({ uaa: { tag: "xsuaa" } });
  
  // Mount JWT validation middleware using the XSUAA configurations
  app.use(xssec.JWTStrategy(xsuaaServices.uaa));
  console.log("XSUAA JWT validation middleware mounted successfully.");
} catch (err) {
  console.warn("XSUAA service binding not detected. Middleware running in debug/bypass mode.");
  
  // Fallback dev mock middleware for local verification
  app.use((req, res, next) => {
    req.authInfo = {
      checkScope: (scopeName) => true, // Auto-approve during local testing
      getLogonName: () => "mock.developer@sap-service.com",
      getEmail: () => "mock.developer@sap-service.com",
      getGivenName: () => "Mock",
      getFamilyName: () => "Developer",
      getOrigin: () => "sap.ids",
      getScopes: () => ["$XSAPPNAME.read", "$XSAPPNAME.write"]
    };
    next();
  });
}

// Protected Resource Endpoint
app.get("/api/users-directory", (req, res) => {
  // 1. Programmatic scope validation
  const canReadUsers = req.authInfo.checkScope("$XSAPPNAME.read");
  
  if (!canReadUsers) {
    return res.status(403).json({ 
      error: "Forbidden", 
      message: "Insufficient permissions. Required scope: $XSAPPNAME.read" 
    });
  }

  // 2. Access user info details decoded from JWT
  const activeUser = {
    userName: req.authInfo.getLogonName(),
    email: req.authInfo.getEmail(),
    firstName: req.authInfo.getGivenName(),
    lastName: req.authInfo.getFamilyName(),
    origin: req.authInfo.getOrigin()
  };

  res.json({
    auditedBy: activeUser,
    tenantId: "global-subaccount-9876-uuid",
    status: "Success",
    usersCount: 4,
    // Return mock database information
    data: [
      { id: "u-1", name: "Jane Doe", email: "jane.doe@enterprise.com", origin: "azure-ad", role: "Admin" },
      { id: "u-2", name: "John Smith", email: "john.dev@sap-service.com", origin: "sap.ids", role: "Developer" }
    ]
  });
});

app.listen(PORT, () => {
  console.log(\`Server listening on port \${PORT}\`);
});
`;
}
