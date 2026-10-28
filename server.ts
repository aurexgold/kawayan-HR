import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with recommended header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Generate Employee Handbook Sections
app.post('/api/handbook/generate', async (req, res) => {
  try {
    const {
      companyName = 'Kawayan Cooperative & Enterprises Inc.',
      industry = 'Cooperative & Financial Services',
      workSetup = 'Hybrid (3 days office, 2 days telecommuting)',
      workingSchedule = 'Monday to Friday, 8:30 AM – 5:30 PM (40 hours/week, 1-hour unpaid meal break)',
      probationaryMonths = 6,
      leavePolicy = {
        silDays: 5,
        vacationDays: 12,
        sickDays: 10,
        soloParentDays: 7,
      },
      cultureTone = 'Professional & Cooperative (People-First)',
      customPolicies = '',
      targetChapter = 'all', // 'all' or specific chapter title
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured. Utilizing built-in DOLE Standard Philippine Labor Code Template.',
      });
    }

    const systemPrompt = `You are an expert Philippine Labor Law Attorney, HR Executive, and Department of Labor and Employment (DOLE) Compliance Auditor.
Your task is to draft comprehensive, legally enforceable, and standardized sections for a Philippine Employee Handbook.

LEGAL STANDARDS TO STRICTLY COMPLY WITH AND CITE:
- Presidential Decree No. 442 (The Labor Code of the Philippines, as renumbered)
- RA 11313 (Safe Spaces Act) & RA 7877 (Anti-Sexual Harassment Act) - Committee on Decorum and Investigation (CODI)
- RA 11058 (Occupational Safety and Health Standards Law) & DOLE D.O. 198-18
- RA 11210 (105-Day Expanded Maternity Leave Law)
- RA 8187 (Paternity Leave Act), RA 11861 (Expanded Solo Parents Welfare Act)
- RA 9262 (Anti-Violence Against Women and Their Children Act - 10 Days Paid Leave)
- RA 9710 (Magna Carta of Women - Special Leave for Gynecological Surgeries)
- Presidential Decree No. 851 (13th Month Pay Law)
- Articles 83-90 Labor Code (8-hour work day, 125% regular OT, 130% rest day OT, 10% Night Shift Differential 10PM-6AM)
- Article 297/298 & Twin-Notice Rule (Notice to Explain with min. 5 calendar days to answer + administrative conference + Notice of Decision)
- DOLE Labor Advisory No. 06-20 (Release of Final Pay within 30 days and Certificate of Employment within 3 days)
- RA 10173 (Data Privacy Act of 2012) & National Privacy Commission rules

Format response strictly in valid JSON matching this schema:
{
  "handbookTitle": "string",
  "generatedAt": "string",
  "doleComplianceRating": "Compliant (100% Philippine Statutory Alignment)",
  "chapters": [
    {
      "id": "chap-1",
      "chapterNumber": 1,
      "title": "string",
      "subtitle": "string",
      "statutoryReferences": ["string", "string"],
      "content": "string (Markdown with clear headers, subsections, bullet points, and exact legal rules)"
    }
  ]
}

Ensure all generated chapters contain rigorous, actionable clauses tailored to ${companyName} (${industry}).`;

    const userPrompt = `Generate the standardized Philippine Employee Handbook for:
Company: ${companyName}
Industry: ${industry}
Work Setup: ${workSetup}
Working Schedule: ${workingSchedule}
Probationary Period: ${probationaryMonths} months (Art. 296 Labor Code)
Leaves: ${leavePolicy.vacationDays} Vacation, ${leavePolicy.sickDays} Sick, ${leavePolicy.silDays} Service Incentive, ${leavePolicy.soloParentDays} Solo Parent
Culture & Tone: ${cultureTone}
Specific Custom Directives: ${customPolicies || 'Standard enterprise rules, biometrics logging, coop staff assistance'}
Target Scope: ${targetChapter === 'all' ? 'All 7 mandatory Philippine Labor Code chapters' : `Detailed focus on ${targetChapter}`}

Produce the complete handbook chapters with full detail and DOLE compliance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      return res.status(200).json({
        fallback: true,
        message: 'Could not parse JSON response from AI. Falling back to built-in DOLE template.',
      });
    }

    return res.json({
      fallback: false,
      data: parsed,
    });
  } catch (err: any) {
    console.error('Gemini Handbook Generation Error:', err);
    return res.status(200).json({
      fallback: true,
      error: err?.message || 'Server-side AI processing error',
    });
  }
});

// API: Refine Specific Handbook Clause or Section
app.post('/api/handbook/refine', async (req, res) => {
  try {
    const { sectionTitle, currentContent, userInstruction, companyName } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured.',
      });
    }

    const prompt = `You are a Philippine Labor Law specialist.
Refine the following handbook section according to the requested instruction, keeping DOLE and Labor Code compliance intact.

Section Title: ${sectionTitle}
Company: ${companyName || 'The Company'}
Current Content:
${currentContent}

User Instruction:
${userInstruction}

Return ONLY the revised Markdown text of the section, with professional formatting, clear legal references, and specific actionable guidelines.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an attorney specializing in Philippine Labor Code (PD 442) and DOLE advisories.',
      },
    });

    return res.json({
      success: true,
      refinedContent: response.text,
    });
  } catch (err: any) {
    console.error('Gemini Refine Error:', err);
    return res.status(500).json({
      error: err?.message || 'Refinement failed',
    });
  }
});

// API: Audit Handbook against Philippine Labor Code & DOLE Requirements
app.post('/api/handbook/audit', async (req, res) => {
  try {
    const { handbookText } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(200).json({
        fallback: true,
      });
    }

    const prompt = `Conduct a rigorous Philippine Labor Standards & DOLE Compliance Audit on this employee handbook excerpt:

${handbookText.substring(0, 15000)}

Verify the following 10 critical Philippine statutory points:
1. Safe Spaces Act (RA 11313) & CODI setup
2. OSH Standards (RA 11058 & DOLE DO 198-18)
3. 105-Day Expanded Maternity Leave (RA 11210)
4. Service Incentive Leave (Art. 95) & 13th Month Pay (PD 851)
5. Paternity Leave (RA 8187) & Solo Parent (RA 11861)
6. VAWC Leave (RA 9262) & Magna Carta for Women (RA 9710)
7. Twin-Notice Procedural Due Process (NTE min 5 days + hearing + decision)
8. DOLE LA 06-20 Final Pay Release within 30 days
9. Night Shift Differential (10%) & Overtime computation (125%/130%/169%/260%)
10. Drug-Free Workplace (RA 9165) & Mental Health (RA 11036)

Return response strictly in valid JSON format:
{
  "complianceScore": 95,
  "status": "DOLE Compliant" | "Minor Gaps" | "High Risk",
  "checklist": [
    {
      "requirement": "string",
      "lawReference": "string",
      "isCompliant": true,
      "details": "string"
    }
  ],
  "recommendations": ["string", "string"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      fallback: false,
      audit: parsed,
    });
  } catch (err: any) {
    console.error('Audit Error:', err);
    return res.status(200).json({ fallback: true });
  }
});

// API: Philippine Labor Code & DOLE Compliance AI Assistant
app.post('/api/compliance/chat', async (req, res) => {
  try {
    const { question, conversationHistory = [], category = 'general' } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getGeminiClient();

    // Built-in Philippine Labor Law Knowledge Base for instant legal accuracy
    const getOfflineComplianceAnswer = (q: string, cat: string) => {
      const qLower = q.toLowerCase();

      if (qLower.includes('13th month') || qLower.includes('thirteenth month') || qLower.includes('pd 851')) {
        return {
          answer: "Under Presidential Decree No. 851 and DOLE Labor Advisory No. 25-23, all rank-and-file employees who have worked for at least one (1) month during the calendar year are entitled to 13th Month Pay, regardless of employment status. It must be paid on or before December 24.\n\nComputation:\nTotal Basic Salary Earned during the calendar year ÷ 12.\n\nImportant DOLE Rules:\n1. Basic salary excludes allowances, overtime, night shift differential, holiday pay, and unused leave cash conversions.\n2. Resigned or terminated employees are entitled to pro-rated 13th month pay covering the months they rendered service.\n3. Non-compliance subjects the employer to DOLE monetary claims and mandatory inspection notices with legal interest.",
          legalReferences: [
            "Presidential Decree No. 851 (13th Month Pay Law)",
            "DOLE Labor Advisory No. 25, Series of 2023",
            "Revised Guidelines on the Implementation of PD 851"
          ],
          actionChecklist: [
            "Audit payroll records from January 1 to November 30 to aggregate total actual basic salary earned.",
            "Verify that no statutory deductions (except BIR withholding tax if annual total exceeds ₱90,000 de minimis cap) reduce the 13th month pay.",
            "Disburse payment on or before December 24.",
            "File the DOLE 13th Month Pay Compliance Report online via the DOLE Establishment Report System (reports.dole.gov.ph) on or before January 15."
          ],
          riskAssessment: "High Legal Risk if delayed past Dec 24 (non-waivable statutory right; DOLE inspection sanctionable)",
          category: "Wages & Benefits"
        };
      }

      if (qLower.includes('terminate') || qLower.includes('dismiss') || qLower.includes('art 297') || qLower.includes('art 298') || qLower.includes('just cause') || qLower.includes('authorized cause') || qLower.includes('twin notice')) {
        return {
          answer: "Under Articles 297 and 298 [renumbered] of the Labor Code of the Philippines, an employer can only dismiss an employee for Just Causes or Authorized Causes, with STRICT observance of the Twin-Notice Rule (Procedural Due Process).\n\n1. Just Causes (Art. 297 - Employee's fault, No separation pay):\n- Serious misconduct or willful disobedience (insubordination)\n- Gross and habitual neglect of duties\n- Fraud or willful breach of trust (loss of confidence)\n- Commission of a crime against employer or family\n\n2. Authorized Causes (Art. 298/299 - Business reasons, With separation pay):\n- Installation of labor-saving devices (1 month or 1 mo/year service)\n- Redundancy (1 month or 1 mo/year service)\n- Retrenchment to prevent losses (1 month or 0.5 mo/year service)\n- Closure or cessation of business (0.5 mo/year service, unless due to serious losses)\n- Disease not curable within 6 months (0.5 mo/year service)\n\nTwin-Notice Rule for Just Cause:\n- Notice 1: Notice to Explain (NTE) specifying exact violations with a minimum of 5 calendar days for employee to submit written explanation.\n- Hearing/Conference: Opportunity for employee to present evidence and have counsel/representative.\n- Notice 2: Notice of Decision stating reasons after evaluating evidence.",
          legalReferences: [
            "Article 297 & 298, Labor Code of the Philippines (PD 442)",
            "King of Kings Transport v. Mamac (G.R. No. 166208) - Twin Notice Standards",
            "DOLE Department Order No. 147-15 (Rules on Termination of Employment)"
          ],
          actionChecklist: [
            "Draft formal NTE with detailed facts, policy violated, and explicitly state at least 5 calendar days to respond.",
            "Schedule and record the administrative conference.",
            "For Authorized Causes: File DOLE RKS Form 5 at the DOLE Field Office 30 days PRIOR to effective date, and serve 30-day written notice to employee.",
            "Compute statutory separation pay (if authorized cause) and release final pay within 30 days per DOLE LA 06-20."
          ],
          riskAssessment: "Extreme Legal Risk if due process is violated (illegal dismissal claims carry full backwages, reinstatement, and moral damages; failure of twin-notice warrants ₱30k-₱50k nominal damages per Agabon doctrine)",
          category: "Termination & Due Process"
        };
      }

      if (qLower.includes('holiday') || qLower.includes('overtime') || qLower.includes('premium') || qLower.includes('rest day')) {
        return {
          answer: "Under Articles 87, 93, and 94 of the Labor Code and DOLE Labor Advisory on Holiday Pay, Philippine compensation rules are structured as follows:\n\n1. Regular Holiday (e.g., New Year, Independence Day):\n- Unworked: 100% of daily basic rate (if present or on paid leave on workday immediately preceding).\n- Worked (First 8 hours): 200% of daily rate.\n- Worked Overtime: Excess hours × (Hourly Rate × 200% × 130% = 260%).\n- Worked on Scheduled Rest Day: First 8 hours = 260%; OT = Excess hours × (Hourly Rate × 260% × 130% = 338%).\n\n2. Special Non-Working Day:\n- Unworked: 'No work, no pay' principle applies (unless favorable company practice).\n- Worked (First 8 hours): 130% of daily rate.\n- Worked Overtime: Excess hours × (Hourly Rate × 130% × 130% = 169%).\n- Worked on Scheduled Rest Day: First 8 hours = 150%; OT = Excess hours × 195%.\n\n3. Night Shift Differential (Art. 86):\n- Plus 10% on top of the hourly rate for work performed between 10:00 PM and 6:00 AM.",
          legalReferences: [
            "Articles 86, 87, 93, 94, Labor Code of the Philippines",
            "DOLE Handbook on Statutory Monetary Benefits (2024 Edition)",
            "Annual Presidential Proclamations on Philippine Regular and Special Days"
          ],
          actionChecklist: [
            "Confirm employee attendance or paid status on the work day immediately preceding the regular holiday.",
            "Apply correct overtime multiplier in the biometric and payroll calculation engine.",
            "Ensure night shift differential (10%) is compounded onto overtime if overtime extends between 10 PM - 6 AM.",
            "Keep daily time records (DTR) for at least 3 years as mandated by DOLE compliance inspection guidelines."
          ],
          riskAssessment: "Moderate to High Legal Risk (underpayment of holiday pay is the #1 cited finding in DOLE routine labor inspections)",
          category: "Wages & Holiday Pay"
        };
      }

      if (qLower.includes('sil') || qLower.includes('leave') || qLower.includes('service incentive') || qLower.includes('maternity') || qLower.includes('paternity') || qLower.includes('vawc') || qLower.includes('solo parent')) {
        return {
          answer: "Mandatory Philippine Statutory Leaves under the Labor Code and Special Laws:\n\n1. Service Incentive Leave (SIL - Art. 95 Labor Code):\n- 5 days with pay after 1 year of continuous service.\n- Exclusions: Managerial staff, field personnel, establishments regularly employing less than 10 workers.\n- Cash Conversion: Unused SIL is MANDATORILY convertible to cash at the end of the year or upon separation, computed based on the salary rate at the time of conversion.\n\n2. Expanded Maternity Leave (RA 11210):\n- 105 days with full pay for female workers (live childbirth), regardless of civil status.\n- Additional 15 days paid leave for solo parents (total 120 days).\n- 60 days paid leave for miscarriage or emergency termination of pregnancy.\n- Option to allocate up to 7 days to the child's father.\n\n3. Paternity Leave (RA 8187):\n- 7 days with full pay for married male employees for the first 4 deliveries/miscarriages of legitimate spouse.\n\n4. Solo Parent Leave (RA 11861):\n- 7 days paid parental leave after 6 months of employment.\n\n5. Special Leave for Women - Magna Carta (RA 9710):\n- Up to 2 months with full pay following surgery caused by gynecological disorders.\n\n6. VAWC Leave (RA 9262):\n- 10 days paid leave for victims of violence against women and children.",
          legalReferences: [
            "Article 95, Labor Code of the Philippines (Service Incentive Leave)",
            "Republic Act No. 11210 (105-Day Expanded Maternity Leave Law)",
            "Republic Act No. 8187 (Paternity Leave Act)",
            "Republic Act No. 11861 (Expanded Solo Parents Welfare Act of 2022)",
            "Republic Act No. 9262 (Anti-VAWC Act)"
          ],
          actionChecklist: [
            "Automate SIL entitlement after exactly 12 months from employee hire date.",
            "Ensure unused SIL cash conversion is processed in the December payroll or Final Pay.",
            "Submit SSS Maternity Notification online within 30 days of pregnancy confirmation.",
            "Verify Solo Parent ID issued by LGU City/Municipal Social Welfare Office before granting RA 11861 leave."
          ],
          riskAssessment: "High Legal Risk (failure to pay maternity differential or deny VAWC/SIL violates criminal and administrative labor provisions)",
          category: "Statutory Leaves"
        };
      }

      if (qLower.includes('final pay') || qLower.includes('clearance') || qLower.includes('withhold') || qLower.includes('quitclaim') || qLower.includes('coe')) {
        return {
          answer: "Under DOLE Labor Advisory No. 06, Series of 2020 (Guidelines on the Payment of Final Pay and Issuance of Certificate of Employment):\n\n1. 30-Day Mandatory Release Rule:\nFinal pay must be released to the separated or resigned employee within thirty (30) days from the date of separation or resignation, unless there is a more favorable company policy or collective bargaining agreement.\n\n2. Components of Final Pay:\n- Unpaid earned salary\n- Pro-rated 13th month pay\n- Cash equivalent of unused Service Incentive Leave (SIL)\n- Separation pay (if separated under authorized cause)\n- Cash bond or deposits returned\n- Excess tax withheld (tax refund under BIR year-end adjustments)\n\n3. Can the company withhold final pay for pending clearance?\nThe Supreme Court in Milan v. NLRC held that an employer may withhold final pay pending clearance only to the extent necessary to satisfy valid company debts, accountability for company assets, or liquidated unreturned property. However, prolonged withholding past 30 days without substantiated accountable property constitutes illegal withholding of wages under Article 116 of the Labor Code.\n\n4. Certificate of Employment (COE):\nMust be issued within three (3) working days from the employee's request.",
          legalReferences: [
            "DOLE Labor Advisory No. 06, Series of 2020",
            "Article 116, Labor Code of the Philippines (Withholding of Wages)",
            "Milan v. NLRC (G.R. No. 202961) - Clearance and Final Pay Offset Doctrine"
          ],
          actionChecklist: [
            "Fast-track asset return and accountabilities within 14 days of separation notice.",
            "If property is unreturned, document actual monetary value and notify employee in writing.",
            "Disburse final pay and have employee execute a standard DOLE-compliant Quitclaim and Release.",
            "Issue Certificate of Employment within 3 working days of request."
          ],
          riskAssessment: "High Legal Risk (DOLE Single Entry Approach [SEnA] mandatory mediation is triggered if final pay exceeds 30 days)",
          category: "Separation & Final Pay"
        };
      }

      if (qLower.includes('contracting') || qLower.includes('subcontracting') || qLower.includes('do 174') || qLower.includes('endo') || qLower.includes('labor only')) {
        return {
          answer: "Under DOLE Department Order No. 174, Series of 2017 (Rules Implementing Articles 106 to 109 of the Labor Code):\n\n1. Labor-Only Contracting is STRICTLY PROHIBITED.\nLabor-only contracting occurs when:\n- The contractor does not have substantial capital (at least ₱5,000,000 paid-up capital/net worth) OR investment in the form of tools, equipment, machineries, and work premises; AND\n- The contractor's workers perform activities directly related to the main business of the principal; OR\n- The contractor does not exercise the right to control the performance of the work of the employee.\n\n2. Permissible Job Contracting Requirements:\n- The contractor is duly registered with DOLE under DO 174.\n- The contractor exercises control over the manner and means of performing work.\n- A Service Agreement exists containing the Service Fee, Standard Administrative Fee (not less than 10% of total contract cost), and statutory welfare guarantees.\n\n3. Effect of Finding of Labor-Only Contracting:\nThe principal employer shall be treated as the direct employer of the workers with full solidarity for all unpaid wages, benefits, and regular employment status.",
          legalReferences: [
            "DOLE Department Order No. 174, Series of 2017",
            "Articles 106 to 109, Labor Code of the Philippines",
            "Magsalin v. National Organization of Working Men (G.R. No. 148492)"
          ],
          actionChecklist: [
            "Demand copy of valid DOLE DO 174 Certificate of Registration from all outsourced service agencies.",
            "Inspect contractor's Audited Financial Statements to confirm minimum ₱5M paid-up capital.",
            "Ensure the principal's supervisors do NOT exercise direct operational control over contractor's workers.",
            "Verify contractor's monthly proof of SSS, PhilHealth, and Pag-IBIG remittances."
          ],
          riskAssessment: "Critical Legal Risk (DOLE compliance orders mandate regularizing outsourced staff into direct payroll)",
          category: "Contracting & DO 174"
        };
      }

      // Default comprehensive compliance response
      return {
        answer: `Under Philippine Labor Law (Presidential Decree No. 442) and current DOLE regulations regarding "${q}":\n\n1. Core Labor Standards:\nEvery employer in the Philippines must uphold General Labor Standards (GLS) and Occupational Safety and Health (OSH) standards. Management prerogatives must always be exercised in good faith and with due regard to statutory protections for workers.\n\n2. Procedural & Substantive Requirements:\nEnsure that any employment decision complies with statutory due process, documented company rules, and statutory minimum wage rates (Wage Order NCR-24 / Regional Wage Boards). Withholding wages or unilateral salary deductions without employee written authorization violates Article 113 of the Labor Code.\n\n3. Consultation and Documentation:\nFor specific disputes or policy changes, maintain written records for a minimum of three (3) years to present during DOLE Technical Safety and Routine Labor Inspections.`,
        legalReferences: [
          "Presidential Decree No. 442 (The Labor Code of the Philippines, as amended)",
          "DOLE General Labor Standards (GLS) Manual 2024",
          "Republic Act No. 11058 (Occupational Safety and Health Standards Act)"
        ],
        actionChecklist: [
          "Check existing Company Handbook and employment contracts for binding stipulations.",
          "Ensure compliance with regional wage board minimum rates and statutory benefit floors.",
          "Document administrative notices with employee written acknowledgement.",
          "Refer unresolved disputes to the DOLE Single Entry Approach (SEnA) desk for 30-day conciliation."
        ],
        riskAssessment: "Moderate Legal Risk (Ensure full documentation and employee written consent)",
        category: "General Compliance"
      };
    };

    if (!ai) {
      const guidance = getOfflineComplianceAnswer(question, category);
      return res.json({
        success: true,
        source: 'knowledge_base',
        data: guidance,
      });
    }

    // Call Gemini 3.8-flash for contextual, expert compliance reasoning
    const systemPrompt = `You are Senior DOLE Compliance Counsel and Director of Labor Standards in the Philippines.
You provide authoritative, highly precise, and legally grounded compliance guidance for Philippine HR managers and business owners.

JURISDICTION & STATUTORY AUTHORITIES:
- Presidential Decree No. 442 (Labor Code of the Philippines, renumbered articles 1 to 302)
- DOLE Department Orders: D.O. 174-17 (Contracting), D.O. 198-18 (OSH RA 11058), D.O. 237-22 (Telecommuting Act IRR), D.O. 147-15 (Due Process/Dismissals)
- DOLE Labor Advisory No. 06-20 (Final Pay 30-day rule and COE 3-day rule)
- Presidential Decree No. 851 (13th Month Pay) & annual DOLE Advisories
- RA 11210 (105-Day Maternity), RA 8187 (Paternity), RA 11861 (Expanded Solo Parents 2022), RA 9262 (VAWC), RA 9710 (Magna Carta of Women)
- RA 11313 (Safe Spaces Act) & CODI Requirements
- RA 10173 (Data Privacy Act of 2012)
- SSS (RA 11199), PhilHealth (RA 11223), Pag-IBIG (RA 9679), BIR TRAIN Law (RA 10963)
- Leading Supreme Court Jurisprudence: King of Kings v. Mamac (Twin-Notice), Agabon v. NLRC, Serrano v. NLRC, Milan v. NLRC.

RESPONSE FORMAT (Strictly Valid JSON):
{
  "answer": "string (Clear, well-structured explanation using paragraphs and bullet points. Quote specific percentages, timelines, and formulas where applicable)",
  "legalReferences": ["string", "string"],
  "actionChecklist": ["string (Specific step for HR)", "string"],
  "riskAssessment": "string (e.g., 'Low Risk', 'Moderate Risk', 'High Legal Risk', 'Critical NLRC/DOLE Violation Risk' with rationale)",
  "category": "string"
}

Tone: Professional, authoritative, risk-conscious, protective of company legal standing while strictly adhering to employee statutory rights.`;

    const chatPrompt = `HR Manager Question regarding Philippine Labor Compliance:
Question: "${question}"
Category Focus: ${category}
Previous Context: ${JSON.stringify(conversationHistory.slice(-3))}

Provide complete compliance analysis and exact statutory backing in the specified JSON format.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || '{}');
    } catch {
      result = getOfflineComplianceAnswer(question, category);
    }

    return res.json({
      success: true,
      source: 'gemini_ai',
      data: result,
    });
  } catch (err: any) {
    console.error('Compliance Chat Error:', err);
    // On error, seamlessly fallback to knowledge base so HR manager is never blocked
    const fallbackGuidance = {
      answer: "Under Philippine Labor Law (PD 442) and DOLE advisories, employers must ensure full adherence to General Labor Standards, statutory monetary benefits, and procedural due process before implementing employment actions.",
      legalReferences: ["Labor Code of the Philippines (PD 442)", "DOLE General Labor Standards Manual"],
      actionChecklist: [
        "Review company policies for compliance with latest DOLE advisories.",
        "Ensure proper documentation and employee written consent for any payroll adjustment.",
        "Consult local DOLE Field Office or SEnA desk for clarification on gray areas."
      ],
      riskAssessment: "Moderate Legal Risk",
      category: "General Compliance"
    };
    return res.json({
      success: true,
      source: 'fallback',
      data: fallbackGuidance,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: Number(PORT) },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
