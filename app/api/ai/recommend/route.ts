export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/libs/db";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { prompt, userId } = await request.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    // 1. Fetch all songs from the Neon database
    const allSongs = await db.song.findMany();

    if (allSongs.length === 0) {
      return NextResponse.json([]);
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. If Gemini API Key exists, use it to get high-quality recommendation
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Prepare song list text for the prompt
        const songCatalog = allSongs.map(s => `ID: ${s.id} | Title: "${s.title}" | Artist: "${s.author}"`).join("\n");

        const systemInstruction = `You are a professional music DJ and recommendation assistant for a Spotify Clone.
Your job is to analyze the user's mood, request, or vibe prompt and recommend the best matching songs from the provided catalog.
Respond ONLY with a JSON array containing the matching song IDs as integers (e.g., [1, 3, 5]).
If no songs match well, return a JSON array containing up to 3 of the most general songs. Do not write any explanations, markdown blocks, or text. Only the JSON array.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `User prompt: "${prompt}"\n\nCatalog:\n${songCatalog}`,
          config: {
            systemInstruction,
            temperature: 0.2,
          }
        });

        const textResponse = response.text?.trim() || "";
        // Clean markdown code blocks if any
        const cleanedJson = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        const recommendedIds = JSON.parse(cleanedJson);

        if (Array.isArray(recommendedIds)) {
          const matchedSongs = allSongs.filter(song => recommendedIds.includes(song.id));
          return NextResponse.json(matchedSongs.map(song => ({
            id: String(song.id),
            user_id: song.user_id,
            author: song.author || '',
            title: song.title || '',
            song_path: song.song_path || '',
            image_path: song.image_path || '',
          })));
        }
      } catch (geminiError) {
        console.error("Gemini recommendation failed, falling back to local search:", geminiError);
      }
    }

    // 3. Fallback smart keyword-based matching algorithm
    const searchTerms = prompt.toLowerCase().split(/\s+/);
    
    // Score each song based on terms matched
    const scoredSongs = allSongs.map(song => {
      let score = 0;
      const titleLower = (song.title || "").toLowerCase();
      const authorLower = (song.author || "").toLowerCase();

      searchTerms.forEach((term: string) => {
        if (term.length < 3) return; // skip very short terms

        if (titleLower.includes(term)) score += 3;
        if (authorLower.includes(term)) score += 2;
      });

      return { song, score };
    });

    // Sort by score desc, filter out zero scores, and return matches
    const matches = scoredSongs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.song);

    // If no matches, return first 5 songs as default
    const finalSongs = matches.length > 0 ? matches : allSongs.slice(0, 5);

    return NextResponse.json(finalSongs.map(song => ({
      id: String(song.id),
      user_id: song.user_id,
      author: song.author || '',
      title: song.title || '',
      song_path: song.song_path || '',
      image_path: song.image_path || '',
    })));

  } catch (error: any) {
    console.error("[AI_RECOMMEND_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
