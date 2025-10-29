import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string' || !code.trim()) {
      return new Response(
        JSON.stringify({ error: 'Code is required and must be a non-empty string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an AI assistant for a bug classification and correction web app.

Task:
1. Analyze the user's pasted code.
2. Identify and list each bug found with:
   - Bug type (Syntax, Logical, Security, UI, Runtime)
   - Severity (High, Medium, Low)
   - Line number or code snippet where the bug occurs
   - Confidence score (0-100) for your detection accuracy
3. Generate the fully corrected version of the input code, applying all necessary fixes.
4. Highlight or comment changes inline in the corrected code.
5. Return a JSON object with these keys:
   - "bugs": an array of bug objects with details
   - "correctedCode": the complete corrected code as a string
   - "overallConfidence": average confidence score across all bugs (0-100)
6. The output must contain no filler language or explanations outside the JSON.
7. The JSON must be valid for parsing by the frontend.

Example output format:

{
  "bugs": [
    {
      "type": "Syntax Error",
      "severity": "High",
      "line": 3,
      "message": "Missing semicolon.",
      "confidence": 95
    },
    {
      "type": "Logical Error",
      "severity": "Medium",
      "line": 10,
      "message": "Incorrect loop condition.",
      "confidence": 87
    }
  ],
  "correctedCode": "function example() {\\n  // fixed missing semicolon\\n  let a = 10;\\n  for (let i = 0; i < a; i++) {\\n    // fixed loop condition\\n    console.log(i);\\n  }\\n}",
  "overallConfidence": 91
}

Provide only this JSON output in your response.`;

    console.log('Calling Lovable AI to analyze code...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: code }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to analyze code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('No response from AI');
      return new Response(
        JSON.stringify({ error: 'No response from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received, parsing...');

    // Parse the AI response to extract JSON
    let analysisResult;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI response was:', aiResponse);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate the response structure
    if (!analysisResult.bugs || !Array.isArray(analysisResult.bugs) || !analysisResult.correctedCode) {
      console.error('Invalid analysis result structure:', analysisResult);
      return new Response(
        JSON.stringify({ error: 'Invalid analysis result structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analysis complete, returning results');
    
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-code function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
