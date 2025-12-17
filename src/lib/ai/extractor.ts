import { streamText } from "ai";
import { aiModel } from "./client";

export interface ExtractedClause {
  clauseNumber?: string;
  title?: string;
  content: string;
  startOffset?: number;
  endOffset?: number;
}

export async function extractClauses(agreementText: string): Promise<ExtractedClause[]> {
  const prompt = `You are a legal document parser. Extract all distinct clauses from the following agreement text. 
Return a JSON array of clauses, where each clause has:
- clauseNumber (optional): section number or identifier like "3.2" or "Section A"
- title (optional): clause heading or title
- content: the full text of the clause

Be thorough and extract all meaningful clauses. Return ONLY valid JSON, no markdown formatting.

Agreement text:
${agreementText}`;

  const result = await streamText({
    model: aiModel,
    prompt,
    temperature: 0.1,
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }

  // Clean up the response - remove markdown code blocks if present
  const cleaned = fullText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const clauses = JSON.parse(cleaned) as ExtractedClause[];
    
    // Calculate offsets if not provided
    return clauses.map((clause, index) => {
      const searchText = clause.content.substring(0, 100); // Use first 100 chars for search
      const offset = agreementText.indexOf(searchText);
      
      return {
        ...clause,
        startOffset: offset >= 0 ? offset : undefined,
        endOffset: offset >= 0 ? offset + clause.content.length : undefined,
      };
    });
  } catch (error) {
    console.error("Failed to parse extracted clauses:", error);
    // Fallback: treat entire document as one clause
    return [
      {
        content: agreementText,
        startOffset: 0,
        endOffset: agreementText.length,
      },
    ];
  }
}

