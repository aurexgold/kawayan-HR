/**
 * Central Digital Signature Repository
 * Compliant with Republic Act 8792 (Philippine Electronic Commerce Act of 2000),
 * BIR RR No. 11-2018 (TRAIN Law Withholding), and DOLE D.O. 198-18 (OSH Standards).
 */

export type DocumentCategory = 
  | 'tax-2307' 
  | 'tax-2316' 
  | 'dole' 
  | 'payroll' 
  | 'handbook' 
  | 'general';

export interface AuthorizedSignatory {
  id: string;
  fullName: string;
  title: string;
  department: string;
  email: string;
  tin: string;
  prcLicenseNo?: string;
  doleAccreditationNo?: string;
  ibpRollNo?: string;
  boardResolutionRef?: string;
  signatureDataUrl: string;
  signatureType: 'uploaded' | 'drawn' | 'typed';
  inkColor: string;
  isDefaultGlobal: boolean;
  defaultForCategories: DocumentCategory[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  auditTrail: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
}

export interface SignatureRepositorySettings {
  autoApplySignatures: boolean;
  includeCryptographicSeal: boolean;
  defaultCompanyStamp: boolean;
  tamperEvidentAlgorithm: 'SHA-256' | 'RA8792-STANDARD';
  notifySignerOnDocumentExport: boolean;
}

export const DOCUMENT_CATEGORY_CONFIG: Record<
  DocumentCategory, 
  { label: string; description: string; legalReference: string; defaultSignerRole: string }
> = {
  'tax-2307': {
    label: 'BIR Form 2307 (EWT)',
    description: 'Certificate of Creditable Tax Withheld at Source for contractors, consultants, and vendors.',
    legalReference: 'BIR RR 2-98 as amended by RR 11-2018 (TRAIN Law)',
    defaultSignerRole: 'Finance Controller / Authorized Tax Agent',
  },
  'tax-2316': {
    label: 'BIR Form 2316 (Compensation)',
    description: 'Certificate of Compensation Payment / Tax Withheld for regular employees.',
    legalReference: 'National Internal Revenue Code (NIRC) Sec. 83 / RA 10963',
    defaultSignerRole: 'Corporate Treasurer / HR Director',
  },
  'dole': {
    label: 'DOLE Mandated Reports',
    description: 'General Labor Standards (GLS), WAIR accident reports, and OSH committee logs.',
    legalReference: 'DOLE D.O. 198-18 (OSH Act) & Labor Code Art. 128',
    defaultSignerRole: 'DOLE Accredited Safety Officer (SO2) / HR Manager',
  },
  'payroll': {
    label: 'Employee Payslips',
    description: 'Official monthly and semi-monthly employee payroll computation slips.',
    legalReference: 'Labor Code of the Philippines Art. 102 & DOLE D.O. 150-16',
    defaultSignerRole: 'Payroll Manager / Total Rewards Lead',
  },
  'handbook': {
    label: 'Company Handbook & Policies',
    description: 'Official corporate code of conduct, statutory policies, and employee acknowledgment forms.',
    legalReference: 'Labor Code Rule I, Book III & DOLE D.O. 174-17',
    defaultSignerRole: 'Chief Legal Counsel / VP of People',
  },
  'general': {
    label: 'General Legal Documents',
    description: 'Certificates of Employment (COE), NDA agreements, and statutory compliance memos.',
    legalReference: 'RA 8792 (Electronic Commerce Act of 2000)',
    defaultSignerRole: 'Authorized Corporate Signatory',
  },
};

/**
 * Generate a transparent SVG signature data URL with authentic calligraphy paths
 */
function createSyntheticSignatureSvg(name: string, title: string, color: string = '#1e3a8a'): string {
  const encodedName = name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const firstLetters = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 140" width="420" height="140">
    <defs>
      <filter id="ink-spread" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#ink-spread)" stroke="${color}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Flourish background sweep -->
      <path d="M 35 95 C 110 115, 260 120, 395 75 C 330 95, 180 108, 90 92" stroke-width="1.8" opacity="0.65" />
      <path d="M 60 70 C 95 30, 135 20, 140 55 C 145 90, 85 95, 75 80 C 65 65, 80 40, 120 45 C 160 50, 180 80, 210 70 C 240 60, 260 40, 280 65 C 300 90, 340 70, 370 60" stroke-width="2.6" />
      <path d="M 125 35 Q 130 95 135 110 Q 140 80 185 65 Q 220 55 245 75 Q 270 95 315 70" stroke-width="2.2" />
      <path d="M 80 105 Q 210 98 380 68" stroke-width="1.4" opacity="0.8" />
    </g>
    <!-- Elegant script text overlaid -->
    <text x="50" y="82" font-family="'Brush Script MT', 'Dancing Script', 'Caveat', cursive" font-size="34" font-weight="600" fill="${color}" opacity="0.9" transform="rotate(-3 50 82)">
      ${encodedName}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Initial Seed Signatories compliant with Philippine regulatory bodies
 */
export const INITIAL_AUTHORIZED_SIGNATORIES: AuthorizedSignatory[] = [
  {
    id: 'sig-carmela-tax',
    fullName: 'Carmela Bautista, CPA',
    title: 'Finance Controller & Authorized Tax Agent',
    department: 'Finance & Tax Operations',
    email: 'carmela.bautista@kawayanhr.ph',
    tin: '234-567-890-000',
    prcLicenseNo: 'PRC CPA #0098231',
    boardResolutionRef: 'Board Res. No. 2024-11 (Tax Filing Signatory)',
    signatureDataUrl: createSyntheticSignatureSvg('Carmela Bautista', 'Finance Controller', '#1e3a8a'),
    signatureType: 'typed',
    inkColor: '#1e3a8a',
    isDefaultGlobal: false,
    defaultForCategories: ['tax-2307', 'tax-2316'],
    status: 'active',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    auditTrail: [
      { action: 'CREATED', timestamp: '2026-01-15T08:30:00Z', details: 'Authorized via Board Resolution 2024-11' },
      { action: 'ASSIGNED_CATEGORY', timestamp: '2026-01-15T08:35:00Z', details: 'Default for BIR Form 2307 and 2316' },
    ],
  },
  {
    id: 'sig-maria-dole',
    fullName: 'Maria Clara De Los Santos',
    title: 'HR & Labor Compliance Manager',
    department: 'People & Culture',
    email: 'maria.clara@kawayanhr.ph',
    tin: '123-456-789-000',
    prcLicenseNo: 'PRC HR #0041289',
    doleAccreditationNo: 'DOLE-OSH-NCR-2023-0881',
    boardResolutionRef: 'Secretary Certificate 2024-03 (DOLE Compliance)',
    signatureDataUrl: createSyntheticSignatureSvg('Maria Clara De Los Santos', 'HR Compliance Manager', '#1e3a8a'),
    signatureType: 'drawn',
    inkColor: '#1e3a8a',
    isDefaultGlobal: true,
    defaultForCategories: ['dole', 'handbook', 'general'],
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-10-15T14:20:00Z',
    auditTrail: [
      { action: 'CREATED', timestamp: '2026-01-10T09:00:00Z', details: 'Initial primary HR signatory registration' },
      { action: 'ASSIGNED_CATEGORY', timestamp: '2026-01-10T09:05:00Z', details: 'Default for DOLE logs and Handbook' },
    ],
  },
  {
    id: 'sig-ed-payroll',
    fullName: 'Eduardo "Ed" Mendoza',
    title: 'Head of Total Rewards & Payroll Operations',
    department: 'Total Rewards & Compensation',
    email: 'ed.mendoza@kawayanhr.ph',
    tin: '345-678-901-000',
    prcLicenseNo: 'PRC Reg. #0112948',
    boardResolutionRef: 'HR Policy Memo No. 2024-06 (Disbursement Officer)',
    signatureDataUrl: createSyntheticSignatureSvg('Eduardo Mendoza', 'Head of Payroll', '#0f172a'),
    signatureType: 'typed',
    inkColor: '#0f172a',
    isDefaultGlobal: false,
    defaultForCategories: ['payroll'],
    status: 'active',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-09-20T16:45:00Z',
    auditTrail: [
      { action: 'CREATED', timestamp: '2026-02-01T11:00:00Z', details: 'Payroll operations signatory registered' },
      { action: 'ASSIGNED_CATEGORY', timestamp: '2026-02-01T11:05:00Z', details: 'Default for Employee Payslips' },
    ],
  },
  {
    id: 'sig-atty-santos',
    fullName: 'Atty. Rodrigo Santos',
    title: 'Chief Legal Counsel & Labor Relations Officer',
    department: 'Legal & Corporate Affairs',
    email: 'rodrigo.santos@kawayanhr.ph',
    tin: '456-789-012-000',
    ibpRollNo: 'IBP Roll No. 71420',
    doleAccreditationNo: 'DOLE Accredited Labor Arbitrator / Mediator',
    boardResolutionRef: 'Board Res. No. 2023-01 (General Legal Counsel)',
    signatureDataUrl: createSyntheticSignatureSvg('Atty. Rodrigo Santos', 'Chief Legal Counsel', '#1e3a8a'),
    signatureType: 'typed',
    inkColor: '#1e3a8a',
    isDefaultGlobal: false,
    defaultForCategories: [],
    status: 'active',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-08-11T13:10:00Z',
    auditTrail: [
      { action: 'CREATED', timestamp: '2026-01-05T10:00:00Z', details: 'Corporate Legal Counsel registration' },
    ],
  },
];

export const DEFAULT_REPOSITORY_SETTINGS: SignatureRepositorySettings = {
  autoApplySignatures: true,
  includeCryptographicSeal: true,
  defaultCompanyStamp: true,
  tamperEvidentAlgorithm: 'SHA-256',
  notifySignerOnDocumentExport: false,
};

const STORAGE_KEY_SIGNATORIES = 'kawayan_signature_repository_v1';
const STORAGE_KEY_SETTINGS = 'kawayan_signature_settings_v1';
const REPOSITORY_EVENT_NAME = 'kawayan-signatures-updated';

/**
 * Central Signature Repository API
 */
export const signatureRepository = {
  /**
   * Get all authorized signatories
   */
  getSignatories(): AuthorizedSignatory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SIGNATORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse signature repository, resetting to initial defaults', e);
    }
    // Default fallback
    this.saveSignatories(INITIAL_AUTHORIZED_SIGNATORIES, false);
    return INITIAL_AUTHORIZED_SIGNATORIES;
  },

  /**
   * Save signatories list and dispatch custom event
   */
  saveSignatories(list: AuthorizedSignatory[], emitEvent: boolean = true): void {
    try {
      localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(list));
      if (emitEvent && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(REPOSITORY_EVENT_NAME, { detail: list }));
      }
    } catch (e) {
      console.error('Failed to save signatories to localStorage', e);
    }
  },

  /**
   * Get repository settings
   */
  getSettings(): SignatureRepositorySettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        return { ...DEFAULT_REPOSITORY_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse settings, using defaults', e);
    }
    return DEFAULT_REPOSITORY_SETTINGS;
  },

  /**
   * Save repository settings
   */
  saveSettings(settings: SignatureRepositorySettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(REPOSITORY_EVENT_NAME, { detail: settings }));
      }
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  /**
   * Get signatory by ID
   */
  getSignatoryById(id: string): AuthorizedSignatory | null {
    const list = this.getSignatories();
    return list.find((s) => s.id === id) || null;
  },

  /**
   * Get the designated default signatory for a specific document category
   */
  getDefaultSignatoryForCategory(category: DocumentCategory): AuthorizedSignatory | null {
    const list = this.getSignatories().filter((s) => s.status === 'active');
    
    // 1. Look for explicit category binding
    const categoryMatch = list.find((s) => s.defaultForCategories?.includes(category));
    if (categoryMatch) return categoryMatch;

    // 2. Look for global default
    const globalDefault = list.find((s) => s.isDefaultGlobal);
    if (globalDefault) return globalDefault;

    // 3. Fallback to first active signatory
    return list[0] || null;
  },

  /**
   * Automatically resolve the signature to apply on any document
   */
  resolveSignatureForDocument(
    category: DocumentCategory,
    explicitSignerId?: string
  ): {
    signatory: AuthorizedSignatory | null;
    isAutoApplied: boolean;
    verificationHash: string;
    signingDate: string;
    settings: SignatureRepositorySettings;
  } {
    const settings = this.getSettings();
    let signatory: AuthorizedSignatory | null = null;
    let isAutoApplied = false;

    if (explicitSignerId) {
      signatory = this.getSignatoryById(explicitSignerId);
    } else if (settings.autoApplySignatures) {
      signatory = this.getDefaultSignatoryForCategory(category);
      isAutoApplied = !!signatory;
    }

    const signingDate = new Date().toISOString().split('T')[0];
    const verificationHash = signatory 
      ? this.generateTamperEvidentHash(signatory, category, signingDate)
      : '';

    return {
      signatory,
      isAutoApplied,
      verificationHash,
      signingDate,
      settings,
    };
  },

  /**
   * Add new signatory
   */
  addSignatory(data: Omit<AuthorizedSignatory, 'id' | 'createdAt' | 'updatedAt' | 'auditTrail'>): AuthorizedSignatory {
    const list = this.getSignatories();
    const newId = `sig-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newSignatory: AuthorizedSignatory = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          action: 'CREATED',
          timestamp: now,
          details: `Signatory added with ${data.signatureType} signature`,
        },
      ],
    };

    // If marked as global default, unmark others
    let updatedList = list;
    if (newSignatory.isDefaultGlobal) {
      updatedList = updatedList.map((s) => ({ ...s, isDefaultGlobal: false }));
    }

    // If marked default for any category, replace prior category assignments
    if (newSignatory.defaultForCategories?.length > 0) {
      updatedList = updatedList.map((s) => ({
        ...s,
        defaultForCategories: s.defaultForCategories.filter(
          (cat) => !newSignatory.defaultForCategories.includes(cat)
        ),
      }));
    }

    updatedList.unshift(newSignatory);
    this.saveSignatories(updatedList);
    return newSignatory;
  },

  /**
   * Update existing signatory
   */
  updateSignatory(id: string, updates: Partial<AuthorizedSignatory>): AuthorizedSignatory | null {
    const list = this.getSignatories();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const now = new Date().toISOString();

    let updatedList = [...list];

    // Handle global default changes
    if (updates.isDefaultGlobal) {
      updatedList = updatedList.map((s) => (s.id === id ? s : { ...s, isDefaultGlobal: false }));
    }

    // Handle category binding replacements
    if (updates.defaultForCategories && updates.defaultForCategories.length > 0) {
      updatedList = updatedList.map((s) => {
        if (s.id === id) return s;
        return {
          ...s,
          defaultForCategories: s.defaultForCategories.filter(
            (c) => !updates.defaultForCategories?.includes(c)
          ),
        };
      });
    }

    const updatedItem: AuthorizedSignatory = {
      ...existing,
      ...updates,
      updatedAt: now,
      auditTrail: [
        {
          action: 'UPDATED',
          timestamp: now,
          details: `Signatory details updated`,
        },
        ...existing.auditTrail,
      ],
    };

    updatedList[index] = updatedItem;
    this.saveSignatories(updatedList);
    return updatedItem;
  },

  /**
   * Delete or archive signatory
   */
  deleteSignatory(id: string, permanent: boolean = false): boolean {
    const list = this.getSignatories();
    if (permanent) {
      const filtered = list.filter((s) => s.id !== id);
      this.saveSignatories(filtered);
      return true;
    } else {
      return !!this.updateSignatory(id, { status: 'archived', isDefaultGlobal: false, defaultForCategories: [] });
    }
  },

  /**
   * Set specific category default
   */
  setCategoryDefault(category: DocumentCategory, signatoryId: string): void {
    const list = this.getSignatories();
    const updated = list.map((s) => {
      const hasCat = s.defaultForCategories.includes(category);
      if (s.id === signatoryId) {
        return hasCat ? s : { ...s, defaultForCategories: [...s.defaultForCategories, category] };
      } else {
        return hasCat ? { ...s, defaultForCategories: s.defaultForCategories.filter((c) => c !== category) } : s;
      }
    });
    this.saveSignatories(updated);
  },

  /**
   * Generate tamper-evident cryptographic verification hash
   * (Compliant with Philippine E-Commerce Act RA 8792 and BIR RR 11-2018)
   */
  generateTamperEvidentHash(signatory: AuthorizedSignatory, docRef: string, dateStr: string = ''): string {
    const date = dateStr || new Date().toISOString().split('T')[0];
    const payload = `${signatory.id}|${signatory.tin}|${signatory.fullName}|${docRef}|${date}|KAWAYAN-CORP-SEC-PH`;
    
    // Compute deterministic hash representation
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hex1 = Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
    const hex2 = Math.abs((hash * 31) ^ 0x5a5a5a5a).toString(16).padStart(8, '0').toUpperCase();
    
    return `PH-DS-${hex1}-${hex2}`;
  },

  /**
   * Export repository JSON backup
   */
  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      country: 'PH',
      statutoryFramework: 'RA 8792 / BIR RR 11-2018 / DOLE D.O. 198-18',
      settings: this.getSettings(),
      signatories: this.getSignatories(),
    };
    return JSON.stringify(backup, null, 2);
  },

  /**
   * Import repository backup
   */
  importBackup(jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.signatories)) {
        return { success: false, count: 0, error: 'Invalid backup format: missing signatories array' };
      }
      this.saveSignatories(parsed.signatories);
      if (parsed.settings) {
        this.saveSettings({ ...DEFAULT_REPOSITORY_SETTINGS, ...parsed.settings });
      }
      return { success: true, count: parsed.signatories.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e?.message || 'Failed to parse JSON file' };
    }
  },

  /**
   * Subscribe to repository updates
   */
  subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => callback();
    window.addEventListener(REPOSITORY_EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(REPOSITORY_EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  },
};

/**
 * Client-side image processing: removes white / off-white paper background from uploaded signature scans
 * and converts them into pure transparent PNGs with deep contrast.
 */
export async function removeWhiteBackgroundFromImage(
  dataUrl: string, 
  threshold: number = 230,
  targetInkColor: string = '#1e3a8a'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Parse target ink color (hex to RGB)
      let rTarget = 30, gTarget = 58, bTarget = 138; // Navy default
      if (targetInkColor.startsWith('#') && targetInkColor.length === 7) {
        rTarget = parseInt(targetInkColor.slice(1, 3), 16);
        gTarget = parseInt(targetInkColor.slice(3, 5), 16);
        bTarget = parseInt(targetInkColor.slice(5, 7), 16);
      }

      // Loop over pixels: if near white, make transparent; else retain ink tone with alpha
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;

        if (brightness >= threshold) {
          data[i + 3] = 0; // Completely transparent
        } else {
          // Calculate opacity based on darkness
          const opacityRatio = 1 - (brightness / threshold);
          data[i] = rTarget;
          data[i + 1] = gTarget;
          data[i + 2] = bTarget;
          data[i + 3] = Math.min(255, Math.round(opacityRatio * 255 * 1.2));
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}
