import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const DemoContext = createContext(null)
export const TEAM_CAPACITY = 5
const initial = {
  selectedAgentIds: ['buffett', 'dalio', 'livermore', 'simons', 'taleb'],
  captainId: 'dalio',
  selectedEventId: 'gfc',
}

export function DemoProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('qell-v3-demo'))
      const selectedAgentIds = Array.isArray(stored?.selectedAgentIds)
        ? stored.selectedAgentIds.slice(0, TEAM_CAPACITY)
        : initial.selectedAgentIds
      return { ...initial, ...stored, selectedAgentIds }
    }
    catch { return initial }
  })

  useEffect(() => { localStorage.setItem('qell-v3-demo', JSON.stringify(state)) }, [state])

  const value = useMemo(() => ({
    ...state,
    addAgent(id) {
      setState((current) => current.selectedAgentIds.includes(id) || current.selectedAgentIds.length >= TEAM_CAPACITY
        ? current
        : { ...current, selectedAgentIds: [...current.selectedAgentIds, id] })
    },
    removeAgent(id) {
      setState((current) => ({
        ...current,
        selectedAgentIds: current.selectedAgentIds.filter((item) => item !== id),
        captainId: current.captainId === id ? current.selectedAgentIds.find((item) => item !== id) ?? '' : current.captainId,
      }))
    },
    setCaptain(id) { setState((current) => ({ ...current, captainId: id })) },
    setSelectedEvent(id) { setState((current) => ({ ...current, selectedEventId: id })) },
  }), [state])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export const useDemo = () => useContext(DemoContext)
