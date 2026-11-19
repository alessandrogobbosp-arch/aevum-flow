'use client'

import { useState } from 'react'

const examples = [
  { input: "what's my balance", output: "Your wallet balance is shown above." },
  { input: "set limit 5 for 0x123", output: "Setting daily limit of 5 tUSD8 for agent 0x123..." },
  { input: "send 1 to 0xabc", output: "Preparing to send 1 tUSD8 to 0xabc..." },
]

export function AgentChat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'assistant', text: 'Hi, I can help you manage agent spending limits. Try: "set limit 5 for 0x..."' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg = { role: 'user', text: input }
    let response = "I can help with balances, setting limits, or sending. Try being more specific."

    const lower = input.toLowerCase()

    if (lower.includes('balance')) {
      response = "Check the balances at the top of the page."
    } else if (lower.includes('limit') || lower.includes('set')) {
      const match = input.match(/(\d+\.?\d*)/)
      const amount = match ? match[1] : 'some'
      response = `Understood. Setting a daily limit of ${amount} tUSD8. Use the Agent Limit panel to confirm.`
    } else if (lower.includes('send')) {
      response = "To send as an agent, switch to the agent account and use the Agent Send panel."
    } else if (lower.includes('help')) {
      response = "Examples:\n• set limit 5 for 0x...\n• what's the balance\n• send 1 tUSD8"
    }

    setMessages(prev => [...prev, userMsg, { role: 'assistant', text: response }])
    setInput('')
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 max-w-2xl">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Agent Assistant</h3>
      
      <div className="h-48 overflow-y-auto space-y-3 mb-4 text-sm">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
              msg.role === 'user' 
                ? 'bg-cyan-500/20 text-cyan-100' 
                : 'bg-zinc-800 text-zinc-300'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about limits, balance, send..."
          className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-cyan-500 text-black px-4 py-2 rounded-lg text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  )
}
