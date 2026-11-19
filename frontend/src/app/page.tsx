'use client'

import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { WALLET_ADDRESS, TUSD8_ADDRESS } from '@/config/contracts'
import { walletAbi } from '@/config/abi'
import { erc20Abi } from 'viem'
import { useState } from 'react'
import { AgentChat } from '@/components/AgentChat'

function AgentRow({ agent }: { agent: string }) {
  const { data: limit } = useReadContract({
    address: WALLET_ADDRESS,
    abi: walletAbi,
    functionName: 'agentDailyLimit',
    args: [agent as `0x${string}`],
  })

  return (
    <div className="flex items-center justify-between bg-black/40 rounded-lg px-4 py-3">
      <div>
        <p className="font-mono text-sm text-cyan-400">
          {agent.slice(0, 6)}...{agent.slice(-4)}
        </p>
        <p className="text-xs text-zinc-500">Daily limit</p>
      </div>
      <div className="text-right">
        <p className="font-semibold tabular-nums">
          {limit ? (Number(limit) / 1e6).toFixed(2) : '—'}
        </p>
        <p className="text-xs text-zinc-500">tUSD8</p>
      </div>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-medium">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const [modal, setModal] = useState<'transfer' | 'limit' | 'agentsend' | null>(null)
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [agentAddress, setAgentAddress] = useState('')
  const [dailyLimit, setDailyLimit] = useState('')
  const [agentTo, setAgentTo] = useState('')
  const [agentAmount, setAgentAmount] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [watchedAgents, setWatchedAgents] = useState<string[]>([])
  const [newAgent, setNewAgent] = useState('')

  const { data: userBalance } = useReadContract({
    address: TUSD8_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const { data: walletBalance } = useReadContract({
    address: WALLET_ADDRESS,
    abi: walletAbi,
    functionName: 'getBalance',
  })

  const { writeContract, isPending } = useWriteContract()

  useWatchContractEvent({
    address: WALLET_ADDRESS,
    abi: walletAbi,
    eventName: 'Sent',
    onLogs(logs) {
      logs.forEach((log: any) => {
        setHistory((prev) => [{ type: 'Sent', to: log.args.to, amount: Number(log.args.amount) / 1e6 }, ...prev].slice(0, 10))
      })
    },
  })

  useWatchContractEvent({
    address: WALLET_ADDRESS,
    abi: walletAbi,
    eventName: 'Received',
    onLogs(logs) {
      logs.forEach((log: any) => {
        setHistory((prev) => [{ type: 'Received', from: log.args.from, amount: Number(log.args.amount) / 1e6 }, ...prev].slice(0, 10))
      })
    },
  })

  const addAgentToWatch = () => {
    if (newAgent && !watchedAgents.includes(newAgent)) {
      setWatchedAgents([...watchedAgents, newAgent])
      setNewAgent('')
    }
  }

  const handleSend = () => {
    if (!to || !amount) return
    writeContract({
      address: WALLET_ADDRESS,
      abi: walletAbi,
      functionName: 'send',
      args: [to as `0x${string}`, BigInt(Math.floor(parseFloat(amount) * 1e6))],
    })
    setModal(null)
  }

  const handleDeposit = () => {
    if (!amount) return
    writeContract({
      address: TUSD8_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [WALLET_ADDRESS, BigInt(Math.floor(parseFloat(amount) * 1e6))],
    })
  }

  const handleSetLimit = () => {
    if (!agentAddress || !dailyLimit) return
    writeContract({
      address: WALLET_ADDRESS,
      abi: walletAbi,
      functionName: 'setAgentLimit',
      args: [agentAddress as `0x${string}`, BigInt(Math.floor(parseFloat(dailyLimit) * 1e6))],
    })
    setModal(null)
  }

  const handleAgentSend = () => {
    if (!agentTo || !agentAmount) return
    writeContract({
      address: WALLET_ADDRESS,
      abi: walletAbi,
      functionName: 'agentSend',
      args: [agentTo as `0x${string}`, BigInt(Math.floor(parseFloat(agentAmount) * 1e6))],
    })
    setModal(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-60 pointer-events-none"
        style={{ backgroundImage: "url('/skyline.jpg')" }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70 pointer-events-none" />

      <div className="relative z-10">
        <header className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/qday-logo.svg" alt="QDay" className="w-8 h-8" />
              <span className="font-semibold text-lg">Aevum Flow</span>
              <span className="text-xs text-zinc-400 bg-white/10 px-2 py-1 rounded">Testnet</span>
            </div>
            {isConnected ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-cyan-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <button onClick={() => disconnect()} className="text-xs text-zinc-400 hover:text-white">Disconnect</button>
              </div>
            ) : (
              <button onClick={() => connect({ connector: injected() })} className="bg-cyan-500 text-black text-sm font-medium px-4 py-2 rounded-lg">
                Connect
              </button>
            )}
          </div>

          {isConnected && (
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-zinc-400">Your tUSD8</p>
                <p className="text-2xl font-semibold">{userBalance ? (Number(userBalance) / 1e6).toFixed(2) : '0.00'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Wallet</p>
                <p className="text-2xl font-semibold">{walletBalance ? (Number(walletBalance) / 1e6).toFixed(2) : '0.00'}</p>
              </div>
            </div>
          )}
        </header>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <img src="/qday-logo.svg" alt="QDay" className="w-16 h-16 mb-6" />
            <h1 className="text-4xl font-semibold mb-3">Aevum Flow</h1>
            <p className="text-zinc-300 mb-8">Spending limits for AI agents on QDay</p>
            <button onClick={() => connect({ connector: injected() })} className="bg-cyan-500 text-black font-medium px-8 py-3 rounded-xl">
              Connect Wallet
            </button>
          </div>
        ) : (
          <main className="p-6 max-w-5xl mx-auto">
            <div className="flex gap-3 mb-8">
              <button 
                onClick={() => setModal('transfer')} 
                className="px-5 py-2.5 rounded-xl text-sm bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition"
              >
                Transfer
              </button>
              <button 
                onClick={() => setModal('limit')} 
                className="px-5 py-2.5 rounded-xl text-sm bg-violet-500/20 backdrop-blur-md border border-violet-400/30 hover:bg-violet-500/30 text-violet-200 transition"
              >
                Agent Limit
              </button>
              <button 
                onClick={() => setModal('agentsend')} 
                className="px-5 py-2.5 rounded-xl text-sm bg-orange-500/20 backdrop-blur-md border border-orange-400/30 hover:bg-orange-500/30 text-orange-200 transition"
              >
                Agent Send
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-medium text-zinc-400 mb-4">Agent Activity</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Add agent to monitor"
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                  <button onClick={addAgentToWatch} className="bg-white/10 px-3 py-2 rounded-lg text-sm">Add</button>
                </div>
                {watchedAgents.length === 0 ? (
                  <p className="text-sm text-zinc-500">No agents monitored</p>
                ) : (
                  <div className="space-y-2">
                    {watchedAgents.map((agent) => <AgentRow key={agent} agent={agent} />)}
                  </div>
                )}
              </div>

              <AgentChat />
            </div>

            <div className="mt-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-4">Recent Activity</h3>
              {history.length === 0 ? (
                <p className="text-sm text-zinc-500">No transactions yet</p>
              ) : (
                <div className="space-y-1">
                  {history.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                      <span className={tx.type === 'Sent' ? 'text-orange-400' : 'text-cyan-400'}>{tx.type}</span>
                      <span className="font-medium">{tx.amount.toFixed(2)} tUSD8</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        )}
      </div>

      {modal === 'transfer' && (
        <Modal title="Transfer" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input type="text" placeholder="Recipient" value={to} onChange={e => setTo(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm" />
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm" />
            <div className="flex gap-2 pt-2">
              <button onClick={handleDeposit} disabled={isPending} className="flex-1 bg-white/10 py-2.5 rounded-lg text-sm">Deposit</button>
              <button onClick={handleSend} disabled={isPending} className="flex-1 bg-cyan-500 text-black py-2.5 rounded-lg text-sm font-medium">Send</button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'limit' && (
        <Modal title="Set Agent Limit" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input type="text" placeholder="Agent address" value={agentAddress} onChange={e => setAgentAddress(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm" />
            <input type="number" placeholder="Daily limit" value={dailyLimit} onChange={e => setDailyLimit(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm" />
            <button onClick={handleSetLimit} disabled={isPending} className="w-full bg-violet-600 py-2.5 rounded-lg text-sm font-medium mt-2">Set Limit</button>
          </div>
        </Modal>
      )}

      {modal === 'agentsend' && (
        <Modal title="Agent Send" onClose={() => setModal(null)}>
          <div className="space-y-3">
            <input type="text" placeholder="Recipient" value={agentTo} onChange={e => setAgentTo(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm" />
            <input type="number" placeholder="Amount" value={agentAmount} onChange={e => setAgentAmount(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm" />
            <button onClick={handleAgentSend} disabled={isPending} className="w-full bg-orange-500 text-black py-2.5 rounded-lg text-sm font-medium mt-2">Execute</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
