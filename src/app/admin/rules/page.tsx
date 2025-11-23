'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Sparkles, X, CheckSquare, Square } from 'lucide-react'

interface AIModel {
  id: string
  name: string
  initial: string
  selected: boolean
}

interface Rule {
  id: string
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  description: string
  models: string[]
}

export default function RulesPage() {
  const [rules] = useState<Rule[]>([
    {
      id: '1',
      level: 'public',
      description: 'If the chat-bot query is Public',
      models: ['ChatGPT', 'Google Gemini', 'Perplexity']
    },
    {
      id: '2',
      level: 'internal',
      description: 'If the chat-bot query is Internal',
      models: ['ChatGPT']
    },
    {
      id: '3',
      level: 'confidential',
      description: 'If the chat-bot query is Confidential',
      models: ['In-House AI Model']
    },
    {
      id: '4',
      level: 'restricted',
      description: 'If the chat-bot query is Restricted/Sensitive',
      models: []
    },
  ])

  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([
    { id: '1', name: 'ChatGPT', initial: 'A', selected: false },
    { id: '2', name: 'Google Gemini', initial: 'A', selected: false },
    { id: '3', name: 'Perplexity', initial: 'A', selected: false },
    { id: '4', name: 'In-House AI Model', initial: 'A', selected: false },
  ])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'internal': return 'bg-blue-100 text-blue-800'
      case 'confidential': return 'bg-orange-100 text-orange-800'
      case 'restricted': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openRuleModal = (rule: Rule) => {
    setSelectedRule(rule)
    // Pre-select models that are already assigned to this rule
    setAvailableModels(availableModels.map(model => ({
      ...model,
      selected: rule.models.includes(model.name)
    })))
  }

  const toggleModel = (id: string) => {
    setAvailableModels(availableModels.map(model =>
      model.id === id ? { ...model, selected: !model.selected } : model
    ))
  }

  const applyRule = () => {
    // Logic to save the selected models to the rule
    console.log('Applying rule with models:', availableModels.filter(m => m.selected))
    setSelectedRule(null)
  }

  return (
    <AdminLayout title="Rules">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Rules Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <Sparkles size={24} className="text-primary-600" />
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {rules.map((rule) => (
            <button
              key={rule.id}
              onClick={() => openRuleModal(rule)}
              className="w-full text-left p-4 bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-lg transition"
            >
              <p className="text-sm text-gray-700">{rule.description}</p>
              {rule.models.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Models: {rule.models.join(', ')}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rule Configuration Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#F5F3FF] rounded-2xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-lg">
                {selectedRule.level.charAt(0).toUpperCase() + selectedRule.level.slice(1)} Rule
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                If the user query to the chat-bot is deemed {selectedRule.level}, please route the query to:
              </p>
            </div>

            {/* AI Models List */}
            <div className="p-6 space-y-3">
              {availableModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => toggleModel(model.id)}
                  className="w-full flex items-center gap-3 p-3 bg-white hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary-800">{model.initial}</span>
                  </div>
                  <span className="flex-1 text-left font-medium">{model.name}</span>
                  <div className="text-primary-600">
                    {model.selected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRule(null)}
                className="px-6 py-2 rounded-full border border-gray-300 hover:bg-gray-50 transition bg-white"
              >
                Cancel
              </button>
              <button
                onClick={applyRule}
                className="px-6 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}