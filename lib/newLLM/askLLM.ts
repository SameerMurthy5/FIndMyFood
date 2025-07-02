import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



export async function askLLM(prompt: string, restaurants: any, context: any ): Promise<any> {
  const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              `You are a helpful restaurant assistant embedded in a map-based food discovery app.
                The user has searched for restaurants, and you now have access to the list of places currently displayed on the map.
                Each place includes information such as name, location, rating, address, business status, and price level.
                Your goal is to answer follow-up questions from the user that relate to these restaurants.

                Use only the information available from the current list of restaurants when answering questions. If the question is ambiguous, ask for clarification.
                if the question asks for more information about a restaurant that is not answerable with given context, search the web (for exmaple if the user asks for more information on the menu of a restaurant, you can search the web for the restaurant name and menu).
                

                Be brief, friendly, and helpful. If the user asks for suggestions, highlight one or two restaurants and explain why they may be a good fit.
                
                make sure all output easily human readable, no special characters that make it hard to read.`
          },
          {
            role: "user",
            content: `restaurant list:\n ${restaurants} \n 
                       context :\n ${context} \n`,
          },
          {
              role: "user",
              content: `User's question:\n ${prompt}`,
          }
        ],
        tools: [ { type: "web_search_preview" } ],
        max_output_tokens: 400
    });

    const message = response.output_text
    return message;
}