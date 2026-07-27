// domains/academy-intelligence/oracle-service.ts

export type AIRole = "ADMISSIONS" | "COMPANION" | "ADVISOR" | "PARTNER" | "EXEC";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OracleResponse {
  content: string;
  escalated: boolean;
  roleUsed: AIRole;
}

export class OracleService {
  private static mockDatabase: Record<AIRole, Record<string, string>> = {
    ADMISSIONS: {
      "default": "Welcome to Tiptop Virtual Academy! We offer full-time Early Years (N600,000/term), Primary (N750,000/term), and Secondary (N900,000/term) programs. Sibling enrollment qualifies for a 10% base discount. How can I help guide your enrollment today?",
      "pricing": "Our tuition rates are: Early Years - N600,000, Primary - N750,000, and Secondary - N900,000. Sibling registrations concurrently active receive a 10% discount on the base tuition of the 2nd and 3rd child."
    },
    COMPANION: {
      "default": "Hello! I am your Socratic Learning Companion. What topic are we investigating today?",
      "help": "That is an interesting topic! Instead of telling you the solution immediately, let's explore it together. What do you think is our first step to solve this?",
      " fractions": "Fractions tell us how many parts of a whole we have. If we want to add fractions with unlike denominators, they must speak the same language. How can we find a common denominator for them?"
    },
    ADVISOR: {
      "default": "Hello. As your Family Advisor, I can summarize report cards and attendance records. Your child has completed all core mathematics tasks this week with positive engagement. How can I support your home learning schedule today?",
      "credits": "Your current credit account is fully active. The next billing cycle falls on the 1st of August."
    },
    PARTNER: {
      "default": "Greetings Colleague. As your Teaching Partner, I can draft lesson schemes or helper quizzes aligned to the British Curriculum. What are we planning today?",
      "plan": "Here is a drafted lesson scheme for Year 5 Mathematics (Adding fractions): Starter (10 mins Exit Quiz review), Direct Instruction (15 mins on base conversions), Independent Practice (25 mins workbook tasks), and Plenary (10 mins exit ticket)."
    },
    EXEC: {
      "default": "Welcome Administrator. Chief of Staff Console active. System KPI telemetry is normal. Attendance average: 97.4%, Curriculum Coverage: 92.1%, Active registrations: 341. Would you like me to forecast next term's tuition revenue?",
      "forecast": "Based on current registration lead counts, we project a 12% increase in Primary enrollment for Term 1, bringing estimated tuition collections to N42,500,000."
    }
  };

  public static chat(role: AIRole, prompt: string): OracleResponse {
    const cleanPrompt = prompt.toLowerCase();

    // Check Safeguarding / Escalation Triggers
    if (
      cleanPrompt.includes("self-harm") ||
      cleanPrompt.includes("bully") ||
      cleanPrompt.includes("hurt") ||
      cleanPrompt.includes("sad")
    ) {
      return {
        content: "I want to make sure you get the best support possible. I am immediately alerting our pastoral care team and a teacher to join this conversation. Please stay online.",
        escalated: true,
        roleUsed: role
      };
    }

    // Retrieve context response
    let responseText = this.mockDatabase[role]["default"];
    
    if (role === "COMPANION" && cleanPrompt.includes("fraction")) {
      responseText = this.mockDatabase[role][" fractions"];
    } else if (role === "ADMISSIONS" && cleanPrompt.includes("price")) {
      responseText = this.mockDatabase[role]["pricing"];
    } else if (role === "ADVISOR" && cleanPrompt.includes("bill")) {
      responseText = this.mockDatabase[role]["credits"];
    } else if (role === "PARTNER" && cleanPrompt.includes("plan")) {
      responseText = this.mockDatabase[role]["plan"];
    } else if (role === "EXEC" && cleanPrompt.includes("forecast")) {
      responseText = this.mockDatabase[role]["forecast"];
    } else if (cleanPrompt.includes("help") || cleanPrompt.includes("how")) {
      responseText = this.mockDatabase[role]["help"] || responseText;
    }

    return {
      content: responseText,
      escalated: false,
      roleUsed: role
    };
  }
}
