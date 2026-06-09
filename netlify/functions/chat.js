export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = JSON.parse(event.body);

  const messages = [
    {
      role: 'system',
      content: body.system_instruction.parts[0].text
    },
    ...body.contents.map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.parts[0].text
    }))
  ];

  const res = await fetch(`http://${process.env.OLLAMA_IP}:11434/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma3:1b',
      messages
    })
  });

  const data = await res.json();
  const reply = data.choices[0].message.content;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      candidates: [{ content: { parts: [{ text: reply }] } }]
    })
  };
}